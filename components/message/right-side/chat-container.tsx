"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeechBubble } from "./speech-bubble";
import { InputChat } from "./input-chat";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2, Send } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessageByConversationId } from "@/api/message/message";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

export const ChatContainer = () => {
    const { user } = useUserStore();
    const { id: conversationId } = useParams() as { id: string };

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

    // 1. Reseta a flag de scroll inicial ao trocar de conversa
    useEffect(() => {
        setHasInitiallyScrolled(false);
        previousScrollHeightRef.current = 0;
        setShowScrollBottomButton(false);
    }, [conversationId]);

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

    return (
        <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">

            <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="flex flex-col gap-3">
                    <div ref={topSentinelRef} className="flex justify-center p-2 min-h-6">
                        {isFetchingNextPage && (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {allMessages.map((msg) => (
                        <SpeechBubble
                            key={msg.id}
                            message={msg.content}
                            time={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            isOwn={msg.senderId === user?.id}
                        />
                    ))}

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
                <div className="flex items-center gap-2">
                    <InputChat />
                    <Button
                        size={"icon"}
                        className='rounded-full h-12 w-12 shrink-0 cursor-pointer'
                    >
                        <Send className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
