import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const ErrorMainProfile = () => {

    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <section className="flex flex-1 items-center justify-center py-6">
                <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
                    <div className="flex flex-col items-center text-center">
                        {/* Ícone */}
                        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <AlertCircle className="size-8" />
                        </div>

                        {/* Conteúdo */}
                        <div className="mt-5 space-y-2">
                            <h2 className="text-xl font-semibold">
                                Não foi possível carregar o perfil
                            </h2>

                            <p className="text-sm leading-6 text-muted-foreground">
                                Ocorreu um erro ao tentar carregar as informações
                                deste usuário. Tente novamente em alguns instantes.
                            </p>
                        </div>

                        {/* Ação */}
                        <div className="mt-6 flex w-full gap-2">
                            <Button
                                className="h-10 flex-1 gap-2"
                                onClick={handleRefresh}
                            >
                                <RefreshCw className="size-4" />
                                Tentar novamente
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}