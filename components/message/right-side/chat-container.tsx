"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeechBubble } from "./speech-bubble";
import { InputChat } from "./input-chat";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2, Send } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getMessageByConversationId, sendMessage } from "@/api/message/message";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, useState, useLayoutEffect, Fragment } from "react";
import { supabase } from "@/lib/supabase";
import { sendMessageSchema } from "@/schemas/messageSchema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@base-ui/react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { markMessageAsRead } from "@/api/conversation/conversation";

export const ChatContainer = () => {
    const { user } = useUserStore();
    const { id: conversationId } = useParams() as { id: string };

    const queryClient = useQueryClient();

    const topSentinelRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);

    // Guarda a altura do container de scroll antes de carregar o lote antigo
    const previousScrollHeightRef = useRef<number>(0);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: ({ pageParam }) => getMessageByConversationId({
            conversationId,
            cursor: pageParam,
            limit: 20
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
        enabled: !!conversationId,
    });

    // As páginas mais recentes vêm primeiro em data.pages.
    // Invertemos a ordem das páginas ([...data.pages].reverse()) para que 
    // páginas antigas fiquem no TOPO e páginas recentes fiquem embaixo.
    const allMessages = data?.pages
        ? [...data.pages].reverse().flatMap(page => page.messages)
        : [];

    const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

    // Guarda o ID da primeira mensagem não lida no momento em que abre o chat
    const initialUnreadInfoRef = useRef<{ firstId: string | null; count: number }>({
        firstId: null,
        count: 0,
    });

    // Controla a visibilidade do divisor de não lidas (some ao enviar mensagem)
    const [showUnreadBadge, setShowUnreadBadge] = useState(true);

    // 1. Reseta a flag de scroll inicial ao trocar de conversa
    useEffect(() => {
        setHasInitiallyScrolled(false);
        previousScrollHeightRef.current = 0;
        setShowScrollBottomButton(false);
        initialUnreadInfoRef.current = { firstId: null, count: 0 };
        setShowUnreadBadge(true);
    }, [conversationId]);

    // Captura o estado inicial de mensagens não lidas assim que as mensagens são carregadas
    useEffect(() => {
        if (allMessages.length > 0 && initialUnreadInfoRef.current.firstId === null && !hasInitiallyScrolled) {
            const unreadMsgs = allMessages.filter(
                (msg) => msg.senderId !== user?.id && !msg.readAt
            );
            if (unreadMsgs.length > 0) {
                initialUnreadInfoRef.current = {
                    firstId: unreadMsgs[0].id,
                    count: unreadMsgs.length,
                };
            }
        }
    }, [allMessages, user?.id, hasInitiallyScrolled]);

    // 2. Scroll instantâneo para a mensagem mais recente no carregamento inicial
    useEffect(() => {
        if (allMessages.length > 0 && !hasInitiallyScrolled) {
            const timer = setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "auto" });
                setHasInitiallyScrolled(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [allMessages.length, hasInitiallyScrolled, conversationId]);

    // 3. Preserva a posição de visão do usuário ao carregar mensagens antigas (evita loop de busca)
    useLayoutEffect(() => {
        if (hasInitiallyScrolled && previousScrollHeightRef.current > 0) {
            const viewport = topSentinelRef.current?.closest('[data-slot="scroll-area-viewport"]') as HTMLElement;
            if (viewport) {
                const newScrollHeight = viewport.scrollHeight;
                const diff = newScrollHeight - previousScrollHeightRef.current;
                viewport.scrollTop = diff;
                previousScrollHeightRef.current = 0;
            }
        }
    }, [data?.pages?.length, hasInitiallyScrolled]);

    // 4. Sentinela no topo para buscar mais mensagens (ativa apenas após o scroll inicial)
    useEffect(() => {
        const sentinel = topSentinelRef.current;
        if (!sentinel || !hasInitiallyScrolled) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    const viewport = sentinel.closest('[data-slot="scroll-area-viewport"]') as HTMLElement;
                    if (viewport) {
                        previousScrollHeightRef.current = viewport.scrollHeight;
                    }
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, hasInitiallyScrolled]);

    // 5. Monitora a distância do scroll para exibir/esconder o botão flutuante
    useEffect(() => {
        const viewport = topSentinelRef.current?.closest('[data-slot="scroll-area-viewport"]') as HTMLElement;
        if (!viewport) return;

        const handleScroll = () => {
            const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
            setShowScrollBottomButton(distanceFromBottom > 150);
        };

        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
    }, [hasInitiallyScrolled]);

    const scrollToBottomSmooth = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!conversationId) return;

        markMessageAsRead(conversationId);

    }, [conversationId])

    useEffect(() => {
        if (!conversationId) return;
        const markRead = () => {
            // Só marca como lida se a janela/aba estiver focada
            if (document.hasFocus()) {
                markMessageAsRead(conversationId);
            }
        };
        markRead();
        // Se o usuário alternar de aba e voltar para o chat, marca como lida
        window.addEventListener("focus", markRead);
        return () => {
            window.removeEventListener("focus", markRead);
        };
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on("broadcast", { event: "new_message" }, ({ payload }) => {
                // Invalida a query de mensagens para atualizar o chat com a nova mensagem
                queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
                // Se o usuário está com a janela focada/olhando o chat, marca a mensagem nova como lida imediatamente
                if (document.hasFocus()) {
                    markMessageAsRead(conversationId);
                }
                // E rola o chat para o final suavemente
                setTimeout(scrollToBottomSmooth, 100);
            })
            .on("broadcast", { event: "messages_read" }, ({ payload }) => {
                // Quando a outra pessoa lê as mensagens, atualiza a lista de mensagens (checks azuis) e a lista de conversas
                queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);

    const onSubmit = async (data: z.infer<typeof sendMessageSchema>) => {
        const response = await sendMessage(data.content, conversationId);

        if (response.content) {
            form.reset();
            scrollToBottomSmooth();
            // Esconde o divisor de mensagens não lidas ao enviar uma mensagem
            setShowUnreadBadge(false);
        }
    };

    const form = useForm<z.infer<typeof sendMessageSchema>>({
        resolver: zodResolver(sendMessageSchema),
        defaultValues: {
            content: "",
            conversationId: conversationId,
        },
    })

    function formatDateLabel(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return "Hoje";
        if (isYesterday) return "Ontem";

        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
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
                        // 1. Lógica de Data
                        const msgDateLabel = formatDateLabel(msg.createdAt);
                        const prevMsgDateLabel = index > 0 ? formatDateLabel(allMessages[index - 1].createdAt) : null;
                        const showDateDivider = msgDateLabel !== prevMsgDateLabel;
                        // 2. Lógica de Mensagens Não Lidas (usa o estado congelado na abertura do chat)
                        const showUnreadDivider =
                            showUnreadBadge &&
                            msg.id === initialUnreadInfoRef.current.firstId &&
                            initialUnreadInfoRef.current.count > 0;
                        const unreadMessagesCount = initialUnreadInfoRef.current.count;
                        return (
                            <Fragment key={msg.id}>
                                {/* Divisor de Data (Hoje, Ontem, 16/09/2026) */}
                                {showDateDivider && (
                                    <div className="flex justify-center my-3">
                                        <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1 rounded-md shadow-sm font-medium">
                                            {msgDateLabel}
                                        </span>
                                    </div>
                                )}
                                {/* Divisor de Mensagens Não Lidas */}
                                {showUnreadDivider && (
                                    <div className="flex items-center justify-center my-4 relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-green-500/50" />
                                        </div>
                                        <span className="relative bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                                            {unreadMessagesCount} {unreadMessagesCount === 1 ? "mensagem não lida" : "mensagens não lidas"}
                                        </span>
                                    </div>
                                )}
                                {/* Balão da Mensagem */}
                                <SpeechBubble
                                    message={msg.content}
                                    time={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    isOwn={msg.senderId === user?.id}
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
                <form className="flex items-center gap-2 w-full" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex-1">
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
                                        className="rounded-2xl p-3 border w-full"
                                    />
                                </Field>
                            )}
                        />
                    </div>
                    <Button
                        size="icon"
                        className="rounded-full h-12 w-12 shrink-0 cursor-pointer"
                        type="submit"
                    >
                        <Send className="w-6 h-6" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
