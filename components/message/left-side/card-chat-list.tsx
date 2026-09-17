"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TypeConversation } from "@/api/conversation/conversation";
import { useUserStore } from "@/store/useUserStore";

type Props = {
    conversation: TypeConversation;
}

export const CardChatList = ({ conversation }: Props) => {

    const { user } = useUserStore();

    if (!user) return null;

    const pathname = usePathname();

    const isActive = pathname === `/message/${conversation.id}`;

    return (
        <Link href={`/message/${conversation.id}`}>
            <div
                className={`
            ${isActive ? "dark:bg-zinc-800" : ""} 
            flex items-center justify-between p-4 border-b border-border cursor-pointer dark:hover:bg-zinc-800 transition-all 
            `}
            >
                <div className="flex items-center gap-2">
                    <Avatar className="size-10">
                        <AvatarImage src={""} />
                        <AvatarFallback>
                            {conversation.participants.find((participant) => participant.user.id !== user.id)?.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full">
                        <p className="text-text-primary w-96 truncate">
                            {conversation.participants.find((participant) => participant.user.id !== user.id)?.user.name}
                        </p>
                        <p className="text-text-secondary text-sm w-96 truncate">
                            {conversation.messages && conversation.messages.length > 0 ? conversation.messages[0].content : ""}
                        </p>
                    </div>
                </div>
                <div>
                    <div>
                        <p className="text-text-secondary text-sm">
                            {conversation.messages && conversation.messages.length > 0
                                ? new Date(conversation.messages[0].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : ""}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}