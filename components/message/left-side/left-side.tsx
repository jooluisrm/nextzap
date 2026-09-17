"use client"

import { HeaderLeftSide } from "./header-left-side";
import { CardChatList } from "./card-chat-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { getConversations, TypeConversation } from "@/api/conversation/conversation";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export const LeftSide = () => {

    const { data: conversations, isPending } = useQuery({
        queryKey: ["conversations"],
        queryFn: () => getConversations(),
    })

    return (
        <div className="w-150 border-r border-border flex flex-col h-screen overflow-hidden">
            <HeaderLeftSide />
            <ScrollArea className="h-[calc(100vh-125px)]">
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
        </div>
    );
}