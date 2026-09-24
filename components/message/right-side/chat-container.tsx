"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeechBubble } from "./speech-bubble";
import { InputChat } from "./input-chat";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2, Mic, Paperclip, Send, Smile } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessageByConversationId, sendMessage } from "@/api/message/message";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, useState, useLayoutEffect, Fragment, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { sendMessageSchema } from "@/schemas/messageSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@base-ui/react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { markMessageAsRead, TypeConversation } from "@/api/conversation/conversation";

export const ChatContainer = () => {
    const { user } = useUserStore();

    const { id: conversationId } = useParams() as { id: string };

    const queryClient = useQueryClient();

    const conversationsCache =
        queryClient.getQueryData<TypeConversation[]>(["conversations"]);

    const currentConvCache = conversationsCache?.find(
        (conversation) => conversation.id === conversationId
    );

    const unreadCountReal = currentConvCache?._count.messages || 0;

    // Limite dinâmico para garantir que as mensagens não lidas sejam carregadas.
    // Mantém pelo menos 20 mensagens e adiciona 5 mensagens antigas como contexto.
    const fetchLimit = Math.max(20, unreadCountReal + 5);

    const topSentinelRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);

    // Guarda a altura do container antes de carregar mensagens antigas
    const previousScrollHeightRef = useRef<number>(0);

    const [showScrollBottomButton, setShowScrollBottomButton] =
        useState(false);

    /**
     * Guarda o estado das mensagens não lidas EXISTENTE NO MOMENTO
     * em que a conversa foi aberta.
     *
     * Essa informação não deve mudar depois que a conversa for marcada
     * como lida, porque o divisor representa o ponto onde começavam
     * as mensagens que estavam não lidas na entrada.
     */
    const initialUnreadInfoRef = useRef<{
        firstId: string | null;
        count: number;
    }>({
        firstId: null,
        count: 0,
    });

    /**
     * Controla somente a exibição visual do divisor.
     */
    const [showUnreadBadge, setShowUnreadBadge] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["messages", conversationId],

        queryFn: ({ pageParam }) =>
            getMessageByConversationId({
                conversationId,
                cursor: pageParam,
                limit: fetchLimit,
            }),

        initialPageParam: undefined as string | undefined,

        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor ?? undefined,

        enabled: !!conversationId,
    });

    /**
     * As páginas mais recentes vêm primeiro.
     *
     * Invertemos as páginas para que:
     * - mensagens antigas fiquem no topo;
     * - mensagens recentes fiquem embaixo.
     */
    const allMessages = data?.pages
        ? [...data.pages]
            .reverse()
            .flatMap((page) => page.messages)
        : [];

    /**
     * Reseta o estado visual sempre que o usuário troca de conversa.
     *
     * IMPORTANTE:
     * Não colocamos showUnreadBadge como true aqui.
     *
     * Primeiro precisamos descobrir se realmente existem mensagens
     * não lidas nessa nova conversa.
     */
    useEffect(() => {
        setHasInitiallyScrolled(false);
        previousScrollHeightRef.current = 0;
        setShowScrollBottomButton(false);

        initialUnreadInfoRef.current = {
            firstId: null,
            count: 0,
        };

        setShowUnreadBadge(false);
    }, [conversationId]);

    /**
     * Captura as mensagens não lidas ANTES de marcar a conversa
     * como lida no backend.
     *
     * Essa informação fica congelada durante toda a abertura atual
     * da conversa.
     */
    useEffect(() => {
        if (
            !conversationId ||
            !user?.id ||
            allMessages.length === 0 ||
            initialUnreadInfoRef.current.firstId !== null
        ) {
            return;
        }

        const unreadMessages = allMessages.filter(
            (message) =>
                message.senderId !== user.id &&
                !message.readAt
        );

        if (unreadMessages.length === 0) {
            return;
        }

        initialUnreadInfoRef.current = {
            firstId: unreadMessages[0].id,

            // O contador do cache é usado quando disponível.
            // Caso contrário, usamos a quantidade encontrada nas mensagens.
            count:
                unreadCountReal > 0
                    ? unreadCountReal
                    : unreadMessages.length,
        };

        setShowUnreadBadge(true);
    }, [
        conversationId,
        allMessages,
        user?.id,
        unreadCountReal,
    ]);

    /**
     * Função central para marcar a conversa atual como lida.
     *
     * Além do backend, atualizamos imediatamente o cache do React Query.
     */
    const markCurrentConversationAsRead = useCallback(async () => {
        if (!conversationId || !document.hasFocus()) {
            return;
        }

        const conversations =
            queryClient.getQueryData<TypeConversation[]>([
                "conversations",
            ]);

        const currentConversation = conversations?.find(
            (conversation) => conversation.id === conversationId
        );

        /**
         * Se temos a conversa no cache e ela já possui 0 mensagens
         * não lidas, não precisamos fazer outra chamada.
         */
        if (
            currentConversation &&
            currentConversation._count.messages <= 0
        ) {
            return;
        }

        try {
            await markMessageAsRead(conversationId);

            /**
             * Atualiza imediatamente o contador da conversa no cache.
             *
             * Isso evita que, ao sair e voltar para a conversa,
             * o frontend continue acreditando que existem mensagens
             * não lidas.
             */
            queryClient.setQueryData<TypeConversation[]>(
                ["conversations"],
                (oldConversations) => {
                    if (!oldConversations) {
                        return oldConversations;
                    }

                    return oldConversations.map((conversation) =>
                        conversation.id === conversationId
                            ? {
                                ...conversation,
                                _count: {
                                    ...conversation._count,
                                    messages: 0,
                                },
                            }
                            : conversation
                    );
                }
            );

            /**
             * Atualiza as mensagens para refletir o readAt.
             */
            await queryClient.invalidateQueries({
                queryKey: ["messages", conversationId],
            });
        } catch (error) {
            console.error(
                "Erro ao marcar conversa como lida:",
                error
            );
        }
    }, [conversationId, queryClient]);

    /**
     * Depois que as mensagens foram carregadas e o estado inicial
     * de não lidas foi capturado, marcamos a conversa como lida.
     *
     * Isso é importante:
     *
     * carregar mensagens
     *      ↓
     * descobrir quais estavam não lidas
     *      ↓
     * guardar firstId/count
     *      ↓
     * marcar como lidas
     *
     * Assim o divisor continua aparecendo durante essa abertura.
     */
    useEffect(() => {
        if (
            !conversationId ||
            !user?.id ||
            allMessages.length === 0
        ) {
            return;
        }

        /**
         * Só marcamos como lida depois que a captura inicial
         * já foi realizada.
         */
        if (
            initialUnreadInfoRef.current.firstId !== null
        ) {
            markCurrentConversationAsRead();
        }
    }, [
        conversationId,
        user?.id,
        allMessages.length,
        markCurrentConversationAsRead,
    ]);

    /**
     * Se o usuário sair da aba e voltar, marcamos novamente
     * a conversa como lida caso existam novas mensagens.
     */
    useEffect(() => {
        if (!conversationId) {
            return;
        }

        const handleWindowFocus = () => {
            markCurrentConversationAsRead();
        };

        window.addEventListener(
            "focus",
            handleWindowFocus
        );

        return () => {
            window.removeEventListener(
                "focus",
                handleWindowFocus
            );
        };
    }, [
        conversationId,
        markCurrentConversationAsRead,
    ]);

    /**
     * Scroll inicial para a mensagem mais recente.
     */
    useEffect(() => {
        if (
            allMessages.length > 0 &&
            !hasInitiallyScrolled
        ) {
            const timer = setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "auto",
                });

                setHasInitiallyScrolled(true);
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [
        allMessages.length,
        hasInitiallyScrolled,
        conversationId,
    ]);

    /**
     * Preserva a posição do scroll quando mensagens antigas
     * são carregadas no topo.
     */
    useLayoutEffect(() => {
        if (
            hasInitiallyScrolled &&
            previousScrollHeightRef.current > 0
        ) {
            const viewport =
                topSentinelRef.current?.closest(
                    '[data-slot="scroll-area-viewport"]'
                ) as HTMLElement;

            if (viewport) {
                const newScrollHeight =
                    viewport.scrollHeight;

                const diff =
                    newScrollHeight -
                    previousScrollHeightRef.current;

                viewport.scrollTop = diff;

                previousScrollHeightRef.current = 0;
            }
        }
    }, [
        data?.pages?.length,
        hasInitiallyScrolled,
    ]);

    /**
     * Sentinela no topo para carregar mensagens antigas.
     */
    useEffect(() => {
        const sentinel = topSentinelRef.current;

        if (
            !sentinel ||
            !hasInitiallyScrolled
        ) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0].isIntersecting &&
                        hasNextPage &&
                        !isFetchingNextPage
                    ) {
                        const viewport =
                            sentinel.closest(
                                '[data-slot="scroll-area-viewport"]'
                            ) as HTMLElement;

                        if (viewport) {
                            previousScrollHeightRef.current =
                                viewport.scrollHeight;
                        }

                        fetchNextPage();
                    }
                },
                {
                    threshold: 0.1,
                }
            );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        hasInitiallyScrolled,
    ]);

    /**
     * Monitora a distância do final da conversa
     * para mostrar/esconder o botão de scroll.
     */
    useEffect(() => {
        const viewport =
            topSentinelRef.current?.closest(
                '[data-slot="scroll-area-viewport"]'
            ) as HTMLElement;

        if (!viewport) {
            return;
        }

        const handleScroll = () => {
            const distanceFromBottom =
                viewport.scrollHeight -
                viewport.scrollTop -
                viewport.clientHeight;

            setShowScrollBottomButton(
                distanceFromBottom > 150
            );
        };

        viewport.addEventListener(
            "scroll",
            handleScroll
        );

        return () => {
            viewport.removeEventListener(
                "scroll",
                handleScroll
            );
        };
    }, [hasInitiallyScrolled]);

    /**
     * Scroll suave até o final da conversa.
     */
    const scrollToBottomSmooth = () => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    };

    /**
     * Realtime da conversa.
     */
    useEffect(() => {
        if (!conversationId) {
            return;
        }

        const channel = supabase
            .channel(`chat:${conversationId}`)

            /**
             * Nova mensagem recebida.
             */
            .on(
                "broadcast",
                {
                    event: "new_message",
                },
                async ({ payload }) => {
                    /**
                     * Atualiza as mensagens da conversa.
                     */
                    await queryClient.invalidateQueries({
                        queryKey: [
                            "messages",
                            conversationId,
                        ],
                    });

                    /**
                     * Se a mensagem veio de outra pessoa e a janela
                     * está focada, consideramos que o usuário está vendo
                     * a conversa e marcamos como lida.
                     */
                    if (
                        document.hasFocus() &&
                        payload.senderId !== user?.id
                    ) {
                        await markCurrentConversationAsRead();
                    }

                    /**
                     * Mantém o chat no final.
                     */
                    setTimeout(
                        scrollToBottomSmooth,
                        100
                    );
                }
            )

            /**
             * Outra pessoa leu mensagens.
             */
            .on(
                "broadcast",
                {
                    event: "messages_read",
                },
                ({ payload }) => {
                    if (
                        payload.readerId !== user?.id
                    ) {
                        queryClient.invalidateQueries({
                            queryKey: [
                                "messages",
                                conversationId,
                            ],
                        });
                    }
                }
            )

            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [
        conversationId,
        queryClient,
        user?.id,
        markCurrentConversationAsRead,
    ]);

    /**
     * Envio de mensagem.
     */
    const onSubmit = async (
        data: z.infer<typeof sendMessageSchema>
    ) => {
        const response = await sendMessage(
            data.content,
            conversationId
        );

        if (response.content) {
            form.reset();

            // Se havia o aviso de mensagens não lidas,
            // ele deixa de ser exibido após enviar uma mensagem.
            setShowUnreadBadge(false);

            scrollToBottomSmooth();

        }
    };

    const form =
        useForm<z.infer<typeof sendMessageSchema>>({
            resolver: zodResolver(sendMessageSchema),

            defaultValues: {
                content: "",
                conversationId,
            },
        });

    function formatDateLabel(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();

        const isToday =
            date.toDateString() ===
            now.toDateString();

        const yesterday = new Date(now);

        yesterday.setDate(
            now.getDate() - 1
        );

        const isYesterday =
            date.toDateString() ===
            yesterday.toDateString();

        if (isToday) {
            return "Hoje";
        }

        if (isYesterday) {
            return "Ontem";
        }

        return date.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    }
    return (
        <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">

            <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="flex flex-col gap-3">
                    <div ref={topSentinelRef} className="flex justify-center p-2 min-h-6">
                        {isFetchingNextPage && (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {allMessages.map((msg, index) => {
                        const msgDateLabel = formatDateLabel(
                            msg.createdAt
                        );

                        const prevMsgDateLabel =
                            index > 0
                                ? formatDateLabel(
                                    allMessages[index - 1]
                                        .createdAt
                                )
                                : null;

                        const showDateDivider =
                            msgDateLabel !==
                            prevMsgDateLabel;

                        const showUnreadDivider =
                            showUnreadBadge &&
                            msg.id ===
                            initialUnreadInfoRef.current
                                .firstId &&
                            initialUnreadInfoRef.current
                                .count > 0;

                        const unreadMessagesCount =
                            initialUnreadInfoRef.current.count;

                        return (
                            <Fragment key={msg.id}>
                                {showDateDivider && (
                                    <div className="flex justify-center my-3">
                                        <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1 rounded-md shadow-sm font-medium">
                                            {msgDateLabel}
                                        </span>
                                    </div>
                                )}

                                {showUnreadDivider && (
                                    <div className="flex items-center justify-center my-4 relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-green-500/50" />
                                        </div>

                                        <span className="relative bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                                            {unreadMessagesCount}{" "}
                                            {unreadMessagesCount === 1
                                                ? "mensagem não lida"
                                                : "mensagens não lidas"}
                                        </span>
                                    </div>
                                )}

                                <SpeechBubble
                                    message={msg.content}
                                    time={new Date(
                                        msg.createdAt
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                    isOwn={
                                        msg.senderId ===
                                        user?.id
                                    }
                                    readAt={msg.readAt}
                                />
                            </Fragment>
                        );
                    })}

                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Botão Flutuante Centralizado para rolar suavemente até o final */}
            {showScrollBottomButton && (
                <Button
                    onClick={scrollToBottomSmooth}
                    size="icon"
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full h-10 w-10 transition-all duration-200 z-20 cursor-pointer"
                >
                    <ArrowDown className="w-5 h-5" />
                </Button>
            )}

            <div className="p-3 border-t shrink-0">
                <form
                    className="flex items-center gap-2 w-full"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div
                        className="
                flex items-center w-full
                rounded-2xl border
                px-2 py-1
              
            "
                    >
                        {/* Anexar arquivo */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 rounded-full cursor-pointer h-10 w-10"
                            onClick={() =>
                                document.getElementById("message-file")?.click()
                            }
                        >
                            <Paperclip className="w-8 h-8" />
                        </Button>

                        <input
                            id="message-file"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={(e) => {
                                const files = e.target.files;

                                if (!files?.length) return;

                                // TODO: tratar os arquivos selecionados
                                console.log(files);
                            }}
                        />

                        {/* Emoji */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 rounded-full cursor-pointer h-10 w-10"
                            onClick={() => {
                                // TODO: abrir seletor de emojis
                            }}
                        >
                            <Smile className="w-8 h-8" />
                        </Button>

                        {/* Input */}
                        <div className="flex-1 min-w-0">
                            <Controller
                                name="content"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <Input
                                            {...field}
                                            id="content"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite uma mensagem"
                                            autoComplete="off"
                                            className="
                                    border-0
                                    shadow-none
                                    focus-visible:ring-0
                                    focus-visible:ring-offset-0
                                    px-2
                                    h-10
                                    rounded-none
                                    focus:outline-none
                                "
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Enviar / Áudio */}
                        {form.watch("content")?.trim() ? (
                            <Button
                                size="icon"
                                type="submit"
                                className="rounded-full shrink-0 cursor-pointer h-10 w-10"
                            >
                                <Send className="w-8 h-8" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full shrink-0 cursor-pointer h-10 w-10"
                                onClick={() => {
                                    // TODO: iniciar gravação de áudio
                                }}
                            >
                                <Mic className="w-8 h-8" />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
