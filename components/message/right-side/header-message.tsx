"use client"

import { getConversations } from "@/api/conversation/conversation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { usePresence } from "@/providers/presence-provider";
import { useUserStore } from "@/store/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, EllipsisVertical, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DropdownMenuChat } from "./dropdown-menu-chat";

export const HeaderMessage = () => {
    const { user } = useUserStore();
    const { onlineUsers } = usePresence();
    const router = useRouter();
    const { id: conversationId } = useParams() as { id: string };

    const { data: conversations, isPending } = useQuery({
        queryKey: ["conversations"],
        queryFn: () => getConversations(),
    });

    const currentConversation = conversations?.find((conversation) => conversation.id === conversationId);

    const otherParticipant = currentConversation?.participants.find(p => p.userId !== user?.id);

    const isOnline = otherParticipant?.userId ? !!onlineUsers[otherParticipant.userId] : false;

    const handleCloseChat = () => {
        router.push("/message");
    }

    return (
        <div className="h-16 border-b dark:border-zinc-800 w-full flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleCloseChat}
                    className="h-9 w-9 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all"
                    variant={"ghost"}
                    size={"icon"}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                {isPending || !user || !currentConversation || !otherParticipant ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-11 h-11 rounded-full" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ) : (
                    <Link
                        className="flex items-center gap-2"
                        href={`/profile/${otherParticipant.userId}`}
                    >
                        <UserAvatar
                            conversation={currentConversation}
                            className="w-11 h-11"
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-base">{otherParticipant.user.name}</span>
                            <span className={`flex items-center gap-1 text-sm ${isOnline ? "text-green-500" : "text-zinc-500"}`}>
                                {isOnline ? "Online" : "Offline"}
                            </span>
                        </div>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenuChat />
            </div>
        </div>
    );
}
