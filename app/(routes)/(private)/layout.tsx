import { AvatarPopover } from "@/components/user-avatar";
import { LeftSide } from "@/components/message/left-side/left-side";
import { PresenceProvider } from "@/providers/presence-provider";


export default function LayoutMessage({ children }: { children: React.ReactNode }) {

    return <>

        <div className="h-screen w-full flex overflow-hidden">
            <LeftSide />
            <div className="flex-1">
                {children}
            </div>
        </div>
    </>
}