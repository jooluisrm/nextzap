import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AlertCircle, Edit2, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { UserProfileInput, userProfileSchema } from "@/schemas/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileUser } from "@/api/profile/profile";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { UserProfile } from "@/types/type-profile";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";

type Props = {
    profile: UserProfile | null;
}

export const DialogEditProfile = ({ profile }: Props) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { user, setUser } = useUserStore();

    const form = useForm<UserProfileInput>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            name: profile?.name || "",
            bio: profile?.bio || "",
            messageProfile: profile?.messageProfile || "",
            address: profile?.address || "",
            avatar: profile?.avatar || ""
        }
    });

    // Reset de campos quando o dialog for aberto ou profile mudar
    useEffect(() => {
        if (open && profile) {
            form.reset({
                name: profile.name || "",
                bio: profile.bio || "",
                messageProfile: profile.messageProfile || "",
                address: profile.address || "",
                avatar: profile.avatar || ""
            });
        }
    }, [open, profile, form]);

    const onSubmit = async (data: UserProfileInput) => {
        form.clearErrors();

        const response = await updateProfileUser(data);

        // Trata resposta de erro (string retornada pela API)
        if (typeof response === "string") {
            form.setError("root", { message: response });
            return;
        }

        if (response) {
            // Atualiza o estado global se for o próprio usuário logado
            if (user && user.id === response.id) {
                setUser({
                    ...user,
                    name: response.name,
                    avatar: response.avatar || undefined
                });
            }

            await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            setOpen(false);
        }
    };

    const { isSubmitting, isDirty, errors } = form.formState;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button className="h-10 flex-1 gap-2">
                        <Edit2 className="size-4" />
                        Editar Perfil
                    </Button>
                }
            />

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Atualize suas informações pessoais e como elas serão exibidas no seu perfil.
                    </DialogDescription>
                </DialogHeader>

                {/* Banner de erro da API */}
                {errors.root && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{errors.root.message}</span>
                    </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {/* Nome */}
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="name"
                                    placeholder="Como você quer ser chamado?"
                                />
                                <FieldDescription>
                                    Esse nome será exibido no seu perfil.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Bio */}
                    <Controller
                        name="bio"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                                <Textarea
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Conte um pouco sobre você..."
                                    className="min-h-24 resize-none"
                                    maxLength={200}
                                />
                                <div className="flex items-center justify-between gap-2">
                                    <FieldDescription>
                                        Escreva uma breve descrição sobre você.
                                    </FieldDescription>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {field.value?.length ?? 0}/200
                                    </span>
                                </div>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Recado */}
                    <Controller
                        name="messageProfile"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Recado</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Deixe um recado..."
                                    maxLength={30}
                                />
                                <div className="flex items-center justify-between gap-2">
                                    <FieldDescription>
                                        Uma frase curta que aparecerá no seu perfil.
                                    </FieldDescription>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {field.value?.length ?? 0}/30
                                    </span>
                                </div>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Endereço */}
                    <Controller
                        name="address"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Endereço</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="street-address"
                                    placeholder="Ex.: Rua das Flores, 123"
                                    maxLength={100}
                                />
                                <FieldDescription>
                                    Informe seu endereço para exibição no perfil.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Avatar */}
                    <Controller
                        name="avatar"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Foto de perfil</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="https://..."
                                    type="url"
                                />
                                <FieldDescription>
                                    Informe a URL da imagem que deseja utilizar.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <DialogFooter className="pt-2">
                        <DialogClose
                            render={
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            }
                        />

                        <Button
                            type="submit"
                            disabled={isSubmitting || !isDirty}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar alterações"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
