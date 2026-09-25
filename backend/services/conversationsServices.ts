import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export class ConversationService {
    static async getConversation(currentUserId: string) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: currentUserId,
                        isDeleted: false
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                senderId: { not: currentUserId },
                                readAt: null,
                            }
                        }
                    }
                }
            }
        })

        return conversations;
    }

    //verificar se o usuário faz parte da conversa
    static async verifyUserOnConversation(userId: string, conversationId: string) {
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId,
                    conversationId,
                },
            },
        });

        return participant;
    }

    static async markMessageAsRead(userId: string, conversationId: string) {

        const now = new Date();


        await prisma.$transaction([
            // Marcar como lidas todas as mensagens enviadas PELA OUTRA PESSOA que ainda não foram lidas
            prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId }, // Não marca as próprias mensagens do usuário
                    readAt: null,
                },
                data: {
                    readAt: now,
                },
            }),

            prisma.conversationParticipant.update({
                where: {
                    userId_conversationId: {
                        userId,
                        conversationId,
                    },
                },
                data: {
                    lastReadAt: now,
                },
            })
        ]);

        const readPayload = {
            conversationId,
            readerId: userId,
            readAt: now.toISOString(),
        };

        await supabase.channel(`chat:${conversationId}`).send({
            type: "broadcast",
            event: "messages_read",
            payload: readPayload,
        });

        const participants = await prisma.conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true },
        });

        for (const participant of participants) {
            await supabase.channel(`user:${participant.userId}`).send({
                type: "broadcast",
                event: "conversation_read",
                payload: readPayload,
            });
        }

        return {
            message: "Mensagens marcadas como lidas",
            readAt: now,
        }

    }

    static async deleteConversation(conversationId: string, currentUserId: string) {
        // 1. Marca a conversa como "deletada/escondida" apenas para este usuário
        await prisma.conversationParticipant.update({
            where: {
                userId_conversationId: {
                    userId: currentUserId,
                    conversationId,
                },
            },
            data: { isDeleted: true },
        });

        // 2. Verifica se ainda existe algum participante com a conversa "ativa" (isDeleted: false)
        const activeParticipantsCount = await prisma.conversationParticipant.count({
            where: {
                conversationId,
                isDeleted: false,
            },
        });

        // 3. Se deu 0, significa que NINGUÉM mais está vendo essa conversa. Pode apagar do banco!
        if (activeParticipantsCount === 0) {
            await prisma.conversation.delete({
                where: { id: conversationId },
            });
            return { deletedForAll: true };
        }

        return { deletedForAll: false };
    }


}