import { MessageService } from "@/backend/services/messageService";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
        }

        const { searchParams } = request.nextUrl
        const conversationId = searchParams.get("conversationId");
        const cursor = searchParams.get("cursor") || undefined;
        const limit = Number(searchParams.get("limit")) || 20;

        if (!conversationId) {
            return NextResponse.json({ error: "ID de conversa inválido" }, { status: 400 })
        }

        const data = await MessageService.getMessageByConversationId(conversationId, userId, limit, cursor);

        return NextResponse.json(data, { status: 200 })


    } catch (error: any) {
        if (error.message === "Acesso negado ou conversa não encontrada") {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}
