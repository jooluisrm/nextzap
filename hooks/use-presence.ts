import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export const usePresence = () => {
    const { user } = useUserStore();
    const [onlineUsers, setOnlineUsers] = useState<Record<string, { status: "online" | "away" }>>({});

    useEffect(() => {
        if (!user?.id) return;

        // Obter canal existente ou criar um novo
        const channel = supabase.channel("online-users", {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        // Se o canal já foi inscrito anteriormente (ex: por outro componente ou rerender do React), apenas escuta
        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const activeUsers: Record<string, { status: "online" | "away" }> = {};

                Object.keys(state).forEach((key) => {
                    const presence = state[key]?.[0] as any;
                    if (presence) {
                        activeUsers[key] = { status: presence.status || "online" };
                    }
                });

                setOnlineUsers(activeUsers);
            });

        if (channel.state !== "joined" && channel.state !== "joining") {
            channel.subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        userId: user.id,
                        status: "online",
                        onlineAt: new Date().toISOString(),
                    });
                }
            });
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return { onlineUsers };
};
