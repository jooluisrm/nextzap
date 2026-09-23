import { ConversationService } from "@/backend/services/conversationsServices";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ conversationId: string }>
};

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json("Usuário não autenticado", { status: 401 });
        }
        const { conversationId } = await context.params;

        if (!conversationId) {
            return NextResponse.json("Id da conversa não fornecido", { status: 400 });
        }

        const participant = await ConversationService.verifyUserOnConversation(userId, conversationId);

        if (!participant) {
            return NextResponse.json(
                { error: "Você não faz parte desta conversa" },
                { status: 403 }
            );
        }

        await ConversationService.markMessageAsRead(userId, conversationId);

        return NextResponse.json({ message: "Mensagens marcadas como lidas" }, { status: 200 });



    } catch (error) {
        return NextResponse.json({ error: "Erro ao marcar mensagens como lidas" }, { status: 500 });
    }
}