import { Skeleton } from "../ui/skeleton";

export const SkeletonMainProfile = () => {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[320px_1fr]">
                {/* Sidebar */}
                <aside className="h-fit rounded-lg border border-border bg-card p-5">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative">
                            <Skeleton className="size-28 rounded-full" />

                            {/* Status */}
                            <Skeleton className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-card" />
                        </div>

                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-7 w-36" />
                        </div>

                        <Skeleton className="mt-4 h-5 w-52" />
                        <Skeleton className="mt-2 h-5 w-40" />
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Skeleton className="h-10 flex-1 rounded-md" />
                    </div>
                </aside>

                {/* Conteúdo */}
                <div className="flex flex-col gap-6">
                    {/* Informações pessoais */}
                    <section className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-72 max-w-full" />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {/* Email */}
                            <div className="flex min-h-20 items-center gap-3 rounded-lg border border-border p-4">
                                <Skeleton className="size-10 shrink-0 rounded-full" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-full max-w-48" />
                                </div>
                            </div>

                            {/* Membro desde */}
                            <div className="flex min-h-20 items-center gap-3 rounded-lg border border-border p-4">
                                <Skeleton className="size-10 shrink-0 rounded-full" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="flex min-h-20 items-center gap-3 rounded-lg border border-border p-4">
                                <Skeleton className="size-10 shrink-0 rounded-full" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-full max-w-48" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sobre */}
                    <section className="rounded-lg border border-border bg-card p-5">
                        <Skeleton className="h-5 w-14" />

                        <div className="mt-3 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}