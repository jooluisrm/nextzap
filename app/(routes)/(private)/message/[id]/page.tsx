import { ChatContainer } from "@/components/message/right-side/chat-container";
import { HeaderMessage } from "@/components/message/right-side/header-message";

export const PageIdMessage = () => {
    return (
        <div className="h-screen w-full flex flex-col dark:bg-zinc-800/30 overflow-hidden">
            <HeaderMessage />
            <ChatContainer />
        </div>
    )
}

export default PageIdMessage;