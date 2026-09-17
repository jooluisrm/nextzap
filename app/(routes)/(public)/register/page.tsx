"use client"

import { registerUser } from "@/api/user/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod";
import { RegisterInput, registerUserSchema } from "@/schemas/userSchema";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useRouter } from "next/navigation";

const Register = () => {

    const router = useRouter()

    const onSubmit = async (data: RegisterInput) => {
        const response = await registerUser(data);

        if (response.status === 409) {
            form.setError("email", {
                message: "Email já está em uso"
            });
        }
        if (response.user) {
            alert(response.message);
            form.reset();
            router.push("/login");
        }
    }

    const form = useForm<z.infer<typeof registerUserSchema>>({
        resolver: zodResolver(registerUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })


    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="w-[400px] flex flex-col gap-4 p-4 rounded-lg border border-border">
                <h1 className="text-4xl font-bold">Registrar</h1>
                <p className="text-muted-foreground">Crie sua conta</p>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="name">
                                        Nome
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Digite seu nome"
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

                    <FieldGroup>
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirmar Senha
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="confirmPassword"
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
                        {form.formState.isSubmitting ? "Registrando..." : "Registrar"}
                    </Button>
                </form>
                <Link href="/login" className="text-sm text-muted-foreground">Já tem uma conta? Faça login</Link>
            </div>
        </div>
    );
}

export default Register;