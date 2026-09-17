"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUserSchema } from "@/schemas/userSchema";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { loginUser } from "@/api/user/user";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

const Login = () => {
    const router = useRouter();
    const { setUser } = useUserStore();


    const form = useForm<z.infer<typeof loginUserSchema>>({
        resolver: zodResolver(loginUserSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof loginUserSchema>) => {
        const response = await loginUser(data);
        if (response.status === 401) {
            form.setError("password", {
                message: response.message,
            });
            return;
        }
        if (response.status === 404) {
            form.setError("email", {
                message: response.message,
            });
            return;
        }
        if (response.user) {
            form.reset();
            setUser(response.user);
            router.push("/message");
        }
    }

    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="w-[400px] flex flex-col gap-4 p-4 rounded-lg border border-border">
                <h1 className="text-4xl font-bold">Login</h1>
                <p className="text-muted-foreground">Entre na sua conta</p>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>


                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Digite seu email"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">
                                        Senha
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="password"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Digite sua senha"
                                        autoComplete="off"
                                        type="password"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <Button
                        className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white"
                        type="submit"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? "Carregando..." : "Login"}
                    </Button>
                    <Link href="/register" className="text-sm text-muted-foreground">Não tem uma conta? Crie agora</Link>
                </form>
            </div>
        </div>
    );
}

export default Login;