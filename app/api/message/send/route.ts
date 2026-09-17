import { MessageService } from "@/backend/services/messageService";
import { getAuthUserId } from "@/lib/getAuthUser";
import { sendMessageSchema } from "@/schemas/messageSchema";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ error: "Usuario nao autenticado" }, { status: 401 });
        }

        const body = await request.json();

        const validation = await sendMessageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
        }

        const { conversationId, content } = body;

        const newMessage = await MessageService.sendMessage(conversationId, userId, content);

        await supabase.channel(`chat:${conversationId}`).send({
            type: "broadcast",
            event: "new_message",
            payload: newMessage,
        });

        const participants = await prisma.conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true }
        });
        for (const participant of participants) {
            await supabase.channel(`user:${participant.userId}`).send({
                type: "broadcast",
                event: "conversation_updated",
                payload: { conversationId, newMessage },
            });
        }

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error: any) {
        if (error.message === "Acesso negado ou conversa não encontrada") {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}