"use client"

import { logoutUser } from "@/api/user/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { TypeConversation } from "@/api/conversation/conversation";
import { useUserStore } from "@/store/useUserStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { UserProfile } from "@/types/type-profile";

type Props = {
    conversation?: TypeConversation;
    profile?: UserProfile | null;
    className?: string;
    classNameFallback?: string;
}

export const UserAvatar = ({ conversation, profile, className, classNameFallback }: Props) => {

    const { user } = useUserStore();

    if (!user) return null;

    let initials;
    let avatarUrl;

    if (conversation) {
        initials = conversation?.participants.find((participant) => participant.user.id !== user?.id)?.user.name.split(' ').map((n) => n[0]).join('').toUpperCase();
        avatarUrl = conversation?.participants.find((participant) => participant.user.id !== user?.id)?.user.avatar;
    }

    else if (profile) {
        initials = profile?.name.split(' ').map((n) => n[0]).join('').toUpperCase();
        avatarUrl = profile?.avatar;
    }
    else {
        initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();
        avatarUrl = user.avatar;
    }

    return (
        <Avatar className={cn("w-10 h-10 cursor-pointer", className)}>
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className={cn(classNameFallback)}>
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
