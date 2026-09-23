"use client"

import { createNewContact } from "@/api/message/message";
import { getProfileUser } from "@/api/profile/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePresence } from "@/providers/presence-provider";
import { useUserStore } from "@/store/useUserStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CalendarDays, Edit, Edit2, Loader2, Mail, MapPin, MessageCircle, Phone, Pin, ShieldCheck, UserRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../user-avatar";
import { SkeletonMainProfile } from "./skeletons-main-profile";
import { ScrollArea } from "../ui/scroll-area";
import { ErrorMainProfile } from "./error-main-profile";
import { DialogEditProfile } from "./dialog-edit-profile";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";



export const MainProfile = () => {

    const { id: userIdUrl } = useParams<{ id: string }>();
    const { user } = useUserStore();

    const queryClient = useQueryClient();
    const router = useRouter();

    const { onlineUsers } = usePresence();

    const isOnline = userIdUrl ? !!onlineUsers[userIdUrl] : false;

    const { data: profile, isPending, isError } = useQuery({
        queryKey: ['userProfile', userIdUrl],
        queryFn: () => getProfileUser(userIdUrl),
    });

    const createContactMutation = useMutation({
        mutationFn: (email: string) => createNewContact(email),
        onSuccess: (response) => {
            if (response.status === 400) {
                alert(response.message)
                return;
            }
            if (response.conversation) {
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                router.push(`/message/${response.conversation.id}`);
            }
        }
    })

    if (isPending) return <SkeletonMainProfile />
    if (isError) return <ErrorMainProfile />



    return (
        <ScrollArea className="w-full h-full">
            <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex items-center gap-4 border-b border-border pb-4">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Voltar</p>
                        </TooltipContent>
                    </Tooltip>

                    <h1 className="text-xl font-semibold">Perfil</h1>
                </header>
                <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[320px_1fr]">
                    <aside className="h-fit rounded-lg border border-border bg-card p-5">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <UserAvatar
                                    profile={profile}
                                    className="size-28"
                                    classNameFallback="text-3xl font-semibold"
                                />
                                {
                                    isOnline ? (
                                        <span className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-card bg-green-500" />
                                    ) : (
                                        <span className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-card bg-gray-500" />
                                    )
                                }
                            </div>

                            <div className="mt-4 space-y-1">
                                <h2 className="text-2xl font-semibold">{profile?.name}</h2>
                            </div>

                            <p className="mt-4 max-w-64 text-sm leading-6 text-muted-foreground">
                                {profile?.messageProfile ? profile.messageProfile : "Sem recado"}
                            </p>
                        </div>

                        <div className="mt-6 flex gap-2">
                            {
                                user?.id !== userIdUrl ? (
                                    <Button
                                        onClick={() => createContactMutation.mutate(profile?.email as string)}
                                        disabled={createContactMutation.isPending}
                                        className="h-10 flex-1 gap-2">
                                        {createContactMutation.isPending ? (
                                            <Loader2 className="animate-spin size-4" />
                                        ) : (
                                            <MessageCircle className="size-4" />
                                        )}
                                        Mensagem
                                    </Button>
                                ) : (
                                    <DialogEditProfile
                                        profile={profile}
                                    />
                                )
                            }
                        </div>
                    </aside>

                    <div className="flex flex-col gap-6">
                        <section className="rounded-lg border border-border bg-card p-5">
                            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                                <div>
                                    <h3 className="text-base font-semibold">Informações pessoais</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Dados principais exibidos no perfil do usuario.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 grid-cols-1 xl:grid-cols-2">
                                <div
                                    className="flex min-h-20 items-center gap-3 rounded-lg border border-border p-4"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Mail className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="mt-1 truncate font-medium">{profile?.email}</p>
                                    </div>
                                </div>

                                <div
                                    className="flex min-h-20 items-center gap-3 rounded-lg border border-border p-4"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Calendar className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase text-muted-foreground">
                                            Membro desde
                                        </p>
                                        <p className="mt-1 truncate font-medium">{new Date(profile?.createdAt as string).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div
                                    className="flex min-h-20 items-center gap-3 rounded-lg border border-border p-4"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <MapPin className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase text-muted-foreground">
                                            Endereço
                                        </p>
                                        <p className="mt-1 truncate font-medium">{profile?.address || "Não informado"}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-border bg-card p-5">
                            <h3 className="text-base font-semibold">Sobre</h3>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {profile?.bio || "Sem descrição"}
                            </p>
                        </section>
                    </div>
                </section>
            </div>
        </ScrollArea>
    );
}
