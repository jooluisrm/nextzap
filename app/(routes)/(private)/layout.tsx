import { AvatarPopover } from "@/components/avatar-popover";
import { LeftSide } from "@/components/message/left-side/left-side";


export default function LayoutMessage({ children }: { children: React.ReactNode }) {

    return <>
        <div className="h-screen w-full flex overflow-hidden">
            <div className="h-full w-20 py-5 flex flex-col items-center justify-end border-r border-border">
                <AvatarPopover />
            </div>
            <LeftSide />
            <div className="flex-1">
                {children}
            </div>
        </div>
    </>
}