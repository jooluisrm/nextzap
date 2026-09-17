import { LucideMessageCircleHeart } from "lucide-react";

export const MessagePage = () => {
    return (
        <div className="h-full w-full dark:bg-zinc-800/30 flex justify-center items-center">
            <div className="flex flex-col items-center">
                <LucideMessageCircleHeart className="w-12 h-12 mb-4" />
                <h2 className="text-2xl font-medium">Selecione uma conversa</h2>
                <p className="text-sm text-muted-foreground">Selecione uma conversa para começar a conversar</p>
            </div>
        </div>
    );
}

export default MessagePage;