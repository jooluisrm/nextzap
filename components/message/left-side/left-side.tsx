"use client"

import { HeaderLeftSide } from "./header-left-side";
import { CardChatList } from "./card-chat-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { getConversations, TypeConversation } from "@/api/conversation/conversation";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { AvatarPopover } from "@/components/avatar-popover";

export const LeftSide = () => {

    const { user } = useUserStore();

    const queryClient = useQueryClient();

    const { data: conversations, isPending } = useQuery({
        queryKey: ["conversations"],
        queryFn: () => getConversations(),
    });

    useEffect(() => {
        if (!user?.id) return;

        // Inscreve no canal pessoal do usuário para atualizações da lista de conversas
        const channel = supabase
            .channel(`user:${user.id}`)
            .on("broadcast", { event: "conversation_updated" }, () => {
                // Atualiza a lista de conversas (reordena e traz novas conversas ou últimas mensagens)
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, queryClient]);

    return (
        <div className="w-80 md:w-80 lg:w-96 xl:w-105 shrink-0 border-r border-border flex flex-col h-screen overflow-hidden transition-all duration-300">
            <HeaderLeftSide />
            <ScrollArea className="flex-1 min-h-0">
                {
                    isPending ? (
                        <div className="flex flex-col">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border-b border-border">
                                    <div className="flex items-center gap-3 w-full">
                                        <Skeleton className="size-10 rounded-full shrink-0" />
                                        <div className="flex flex-col gap-2 w-full">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3 w-12 shrink-0" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        conversations?.map((conversation) => (
                            <CardChatList key={conversation.id} conversation={conversation} />
                        ))
                    )
                }
            </ScrollArea>
            <div className="h-[75px] p-2 dark:bg-zinc-800/10 border-t border-border flex items-center gap-3 shrink-0">
                <AvatarPopover />
                <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-muted-foreground text-xs">Online</p>
                </div>
            </div>
        </div>
    );
}