import { ChatContainer } from "@/components/message/right-side/chat-container";
import { HeaderMessage } from "@/components/message/right-side/header-message";

export const PageIdMessage = () => {
    return (
        <div className="h-full w-full dark:bg-zinc-800/30">
            <HeaderMessage />
            <ChatContainer />
        </div>
    )
}

export default PageIdMessage;