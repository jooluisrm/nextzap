"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCirclePlus, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { newMessageSchema } from "@/schemas/messageSchema";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createNewContact } from "@/api/message/message";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const DialogNewChat = () => {

    const queryClient = useQueryClient();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof newMessageSchema>>({
        resolver: zodResolver(newMessageSchema),
        defaultValues: {
            email: "",
        },
    })

    const createContactMutation = useMutation({
        mutationFn: (email: string) => createNewContact(email),
        onSuccess: (response) => {
            if (response.status === 400) {
                form.setError("email", {
                    message: response.message,
                });
                return;
            }
            if (response.conversation) {
                // 🔄 Invalida a query 'conversations' para a sidebar atualizar automaticamente
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                form.reset();
                router.push(`/message/${response.conversation.id}`);
                setOpen(false);
            }
        }
    })

    const onSubmit = async (data: z.infer<typeof newMessageSchema>) => {
        createContactMutation.mutate(data.email);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex gap-2"
                    >
                        <MessageCirclePlus />
                        Nova Conversa
                    </Button>
                }
            />
            <DialogContent>
                <DialogTitle>
                    Nova Conversa
                </DialogTitle>
                <DialogDescription>
                    Digite o E-mail para iniciar uma conversa.
                </DialogDescription>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            {...field}
                                            id="email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Digite seu email"
                                            autoComplete="off"
                                        />
                                        <Button type="submit" disabled={form.formState.isSubmitting} className="w-10 h-10" variant="outline">
                                            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
                                        </Button>
                                    </div>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    );
};