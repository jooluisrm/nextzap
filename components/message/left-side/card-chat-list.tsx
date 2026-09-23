"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TypeConversation } from "@/api/conversation/conversation";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "cn";

type Props = {
    conversation: TypeConversation;
}

export const CardChatList = ({ conversation }: Props) => {

    const { user } = useUserStore();
    const queryClient = useQueryClient();

    if (!user) return null;

    const pathname = usePathname();

    const isActive = pathname === `/message/${conversation.id}`;

    const isMyMessage = conversation.messages && conversation.messages.length > 0 ? conversation.messages[0].senderId === user.id : false;

    const hasUnreadMessage =
        conversation.messages &&
        conversation.messages.length > 0 &&
        !isMyMessage &&
        !conversation.messages[0].readAt;

    const unreadCount = conversation._count.messages || 0;

    return (
        <Link href={`/message/${conversation.id}`}>
            <div
                className={`
            ${isActive ? "dark:bg-zinc-800/30" : ""} 
            flex items-center justify-between p-3.5 border-b border-border cursor-pointer dark:hover:bg-zinc-800/30 transition-all gap-2
            `}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="size-10 shrink-0">
                        <AvatarImage src={""} />
                        <AvatarFallback>
                            {conversation.participants.find((participant) => participant.user.id !== user.id)?.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-text-primary font-medium truncate">
                            {conversation.participants.find((participant) => participant.user.id !== user.id)?.user.name}
                        </p>
                        <div className="flex items-center gap-2">
                            {isMyMessage && <span className="text-sm text-zinc-500 dark:text-zinc-400">Você: </span>}
                            <p className="text-text-secondary text-sm truncate">
                                {conversation.messages && conversation.messages.length > 0 ? conversation.messages[0].content : ""}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 text-right flex items-center gap-2">
                    <div className="">
                        {unreadCount > 0 && (
                            <span className="flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold h-5 min-w-5 px-1 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <p className={cn("text-text-secondary text-xs", hasUnreadMessage ? "text-green-500 font-bold" : "")}>
                        {conversation.messages && conversation.messages.length > 0
                            ? new Date(conversation.messages[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                    </p>
                </div>
            </div>
        </Link>
    );
}