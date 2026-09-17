import { MessageService } from "@/backend/services/messageService";
import { getAuthUserId } from "@/lib/getAuthUser";
import { newMessageSchema } from "@/schemas/messageSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {

        const currentUserId = await getAuthUserId();
        if (!currentUserId) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json()

        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { message: "Dados invalidos" },
                { status: 400 }
            )
        }

        const validate = newMessageSchema.safeParse({ email });
        if (!validate.success) {
            return NextResponse.json(
                {
                    message: "Email inválido",
                }, { status: 400 }
            )
        }

        const conversation = await MessageService.createMessage(validate.data, currentUserId);

        return NextResponse.json({ conversation, message: "Conversa encontrada com sucesso!" }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}