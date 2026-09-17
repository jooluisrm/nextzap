"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, EllipsisVertical, Phone, Search, Video, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const data = {
    name: "Teste",
    avatar: "/avatar.png"
}

export const HeaderMessage = () => {

    const router = useRouter();

    const handleCloseChat = () => {
        router.push("/message");
    }

    return (
        <div className="h-16 border-b dark:border-zinc-800 w-full flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <Avatar className="h-11 w-11">
                    <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-base">{data.name}</span>
                    <span className="text-sm text-zinc-500">Online</span>
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