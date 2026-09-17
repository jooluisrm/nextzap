"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface PresenceContextType {
    onlineUsers: Record<string, { status: "online" | "away" }>;
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: {} });

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserStore();
    const [onlineUsers, setOnlineUsers] = useState<Record<string, { status: "online" | "away" }>>({});

    useEffect(() => {
        if (!user?.id) return;

        // Remove qualquer instância anterior do canal (necessário no React Strict Mode)
        const existingChannels = supabase.getChannels();
        const existingChannel = existingChannels.find((ch) => ch.topic === "realtime:online-users");
        if (existingChannel) {
            supabase.removeChannel(existingChannel);
        }

        const channel = supabase
            .channel("online-users", {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            })
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
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        userId: user.id,
                        status: "online",
                        onlineAt: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return (
        <PresenceContext.Provider value={{ onlineUsers }}>
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresence = () => useContext(PresenceContext);
