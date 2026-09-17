import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeechBubble } from "./speech-bubble";
import { InputChat } from "./input-chat";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export const ChatContainer = () => {
    return (
        <div className="flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden">
            <ScrollArea className="h-full flex flex-col gap-2 p-4">
                <div className="flex flex-col gap-3">
                    <SpeechBubble
                        message="Olá! Tudo bem?"
                        time="14:32"
                    />

                    <SpeechBubble
                        message="Tudo certo! E com você?"
                        time="14:33"
                        isOwn
                    />

                    <SpeechBubble
                        message="Também estou bem. Vamos conversar?"
                        time="14:34"
                    />
                </div>
            </ScrollArea>

            <div className="p-3 border-t">
                <div className="flex items-center gap-2">
                    <InputChat />
                    <Button
                        size={"icon"}
                        className='rounded-full h-12 w-12 cursor-pointer'
                    >
                        <Send className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}