import { prisma } from "@/lib/prisma";
import { LoginInput, RegisterInput } from "@/schemas/userSchema";
import bcrypt from "bcryptjs";

export class UserService {
    static async createUser(data: RegisterInput) {

        // Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (existingUser) {
            throw new Error("E-mail já está em uso");
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Criar usuário no banco
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            }
        })
        return user;
    }

    static async loginUser(data: LoginInput) {

        // Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (!existingUser) {
            throw new Error("E-mail não cadastrado");
        }

        const passwordValid = await bcrypt.compare(data.password, existingUser.password)

        if (!passwordValid) {
            throw new Error("Senha inválida");
        }

        return {
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email
            }
        }

    }
}