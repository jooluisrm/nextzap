import { ConversationService } from "@/backend/services/conversationsServices";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const currentUserId = await getAuthUserId();
        if (!currentUserId) {
            return NextResponse.json(
                { message: "Não autorizado" },
                { status: 401 }
            )
        }

        const { conversationId } = await params;

        if (!conversationId) {
            return NextResponse.json(
                { message: "Id da conversa não foi informado." },
                { status: 400 }
            )
        }

        const participant = await ConversationService.verifyUserOnConversation(currentUserId, conversationId);

        if (!participant) {
            return NextResponse.json(
                { message: "Você não tem permissão para limpar esta conversa" },
                { status: 403 }
            )
        }

        const clearedConversation = await ConversationService.deleteConversation(conversationId, currentUserId);

        return NextResponse.json({
            message: "Conversa limpa com sucesso",
            clearedConversation
        })

    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno" },
            { status: 500 }
        )
    }
}