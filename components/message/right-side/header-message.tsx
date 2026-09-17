"use client"

import { TypeConversation } from "@/api/conversation/conversation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePresence } from "@/providers/presence-provider";

import { useUserStore } from "@/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, EllipsisVertical, Phone, Search, Video, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

export const HeaderMessage = () => {
    const { user } = useUserStore();
    const { onlineUsers } = usePresence();
    const router = useRouter();
    const { id: conversationId } = useParams() as { id: string };

    const queryClient = useQueryClient();

    const conversation = queryClient.getQueryData<TypeConversation[]>(['conversations']);

    const currentConversation = conversation?.find((conversation) => conversation.id === conversationId);

    const otherParticipant = currentConversation?.participants.find(p => p.userId !== user?.id);

    const isOnline = otherParticipant?.userId ? !!onlineUsers[otherParticipant.userId] : false;

    const handleCloseChat = () => {
        router.push("/message");
    }

    return (
        <div className="h-16 border-b dark:border-zinc-800 w-full flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <Avatar className="h-11 w-11">
                    <AvatarFallback>
                        {currentConversation?.participants.find((participant) => participant.userId !== user?.id)?.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-base">{otherParticipant?.user.name}</span>
                    <span className={`flex items-center gap-1 text-sm ${isOnline ? "text-green-500" : "text-zinc-500"}`}>
                        {isOnline ? "Online" : "Offline"}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    onClick={handleCloseChat}
                    className="h-9 w-9 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all"
                    variant={"ghost"}
                    size={"icon"}
                >
                    <X className="w-4 h-4" />
                </Button>
                <div className="h-9 w-9 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all">
                    <EllipsisVertical className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}