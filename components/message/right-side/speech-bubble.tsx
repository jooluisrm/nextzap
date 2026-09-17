import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
    message: string;
    time?: string;
    isOwn?: boolean;
    className?: string;
}

export const SpeechBubble = ({
    message,
    time,
    isOwn = false,
    className,
}: SpeechBubbleProps) => {
    return (


        <div className="flex items-center gap-2">
            <div
                className={cn(
                    "relative max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    isOwn
                        ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                        : "mr-auto rounded-bl-sm bg-muted text-foreground",
                    className
                )}
            >
                <div className="flex items-end gap-2">
                    <span className="text-sm">{message}</span>

                    {time && (
                        <span
                            className={cn(
                                "shrink-0 text-[10px]",
                                isOwn
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                            )}
                        >
                            {time}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};