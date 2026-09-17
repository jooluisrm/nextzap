import { UserService } from "@/backend/services/userService";
import { loginUserSchema } from "@/schemas/userSchema";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validation = await loginUserSchema.safeParse(body);

        if (!validation.success) {
            return Response.json({ message: "Dados invalidos" }, { status: 400 });
        }

        const { user } = await UserService.loginUser(validation.data);

        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

        const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secretKey);

        const cookieStore = await cookies();

        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
            path: "/",
        });

        return NextResponse.json(
            { user, message: "Login realizado com sucesso!" },
            { status: 200 }
        );


    } catch (error: any) {
        let status = 400;

        if (error.message === "E-mail não cadastrado") {
            status = 404; // Not Found
        } else if (error.message === "Senha inválida") {
            status = 401; // Unauthorized
        }

        return NextResponse.json({ message: error.message, status }, { status });
    }

}
