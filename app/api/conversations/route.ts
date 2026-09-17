import { ConversationService } from "@/backend/services/conversationsServices";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const currentUserId = await getAuthUserId();
        if (!currentUserId) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        const conversations = await ConversationService.getConversation(currentUserId);

        return NextResponse.json({ conversations, message: "Conversas carregadas com sucesso" }, { status: 200 });


    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}