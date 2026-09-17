import { UserService } from "@/backend/services/userService";
import { registerUserSchema } from "@/schemas/userSchema"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const validation = registerUserSchema.safeParse(body);
        if (!validation.success) {
            return Response.json({ message: "Dados invalidos, tente novamente." }, { status: 400 })
        }

        const user = await UserService.createUser(validation.data);

        return Response.json({ user, message: "Usuário criado com sucesso!" }, { status: 201 });

    } catch (error: any) {
        const status = error.message === "E-mail já está em uso" ? 409 : 400;
        return Response.json({ message: error.message }, { status: status });
    }
}