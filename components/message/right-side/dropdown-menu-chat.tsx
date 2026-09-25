"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertCircle, EllipsisVertical, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { clearConversationForUser } from "@/api/conversation/conversation";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";

export const DropdownMenuChat = () => {
    const [open, setOpen] = useState(false);


    const { id: conversationId } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const router = useRouter();

    const { isPending, isError, error, reset, mutate } = useMutation({
        mutationFn: () => clearConversationForUser(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setOpen(false);
            router.push('/message');
            toast.add({
                type: "success",
                description: "Conversa deletada da sua lista.",
            })
        },
        onError: (error: any) => {
            console.log(error);
        }
    })


    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger render={<Button className="h-9 w-9 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all" variant="ghost" />}>
                    <EllipsisVertical className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="cursor-pointer text-red-500 transition-all" onClick={() => setOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                            Deletar
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza que deseja deletar essa conversa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso vai apagar permanentemente essa conversa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {isError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erro!</AlertTitle>
                            <AlertDescription>
                                {error.message}
                            </AlertDescription>
                        </Alert>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => reset()}>Cancelar</AlertDialogCancel>
                        <Button
                            className="bg-red-500 text-white hover:bg-red-800 cursor-pointer transition-all"
                            onClick={() => mutate()}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {isError ? "Tentar novamente" : "Deletar"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}