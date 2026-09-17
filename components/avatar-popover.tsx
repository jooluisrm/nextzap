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
import { useUserStore } from "@/store/useUserStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const AvatarPopover = () => {

    const { clearUser, user } = useUserStore();
    const router = useRouter();

    const handleLogout = async () => {
        await logoutUser();
        clearUser();
        router.push('/login');
    }

    if (!user) return null;

    return (
        <Popover>
            <PopoverTrigger >
                <Avatar className="w-10 h-10 cursor-pointer">
                    <AvatarImage src="" />
                    <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverHeader>
                    <PopoverTitle>{user?.name}</PopoverTitle>
                    <PopoverDescription>{user?.email}</PopoverDescription>
                </PopoverHeader>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLogout()}
                    className="flex items-center justify-start gap-2 w-full"
                >
                    <LogOut />
                    Sair
                </Button>
            </PopoverContent>
        </Popover>
    );
}
