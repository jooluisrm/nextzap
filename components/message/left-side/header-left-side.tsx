import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCirclePlus, Plus, PlusCircle, Search } from "lucide-react";
import { DialogNewChat } from "./dialog-new-chat";

export const HeaderLeftSide = () => {
    return (
        <div className="p-4 bg-background border-b">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">NextZap</h1>
                <DialogNewChat />
            </div>
            <div className="relative mt-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." className="rounded-full h-11 pl-12" />
            </div>
        </div>
    );
}