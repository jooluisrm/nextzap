import { NewMessageInput } from "@/schemas/messageSchema";
import { prisma } from "@/lib/prisma";

export class MessageService {
    static async createMessage(data: NewMessageInput, currentUserId: string) {

        const recipient = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (!recipient) {
            throw new Error("Usuário não encontrado");
        }

        // Impede conversa consigo mesmo
        if (recipient.id === currentUserId) {
            throw new Error("Você não pode iniciar uma conversa consigo mesmo");
        }

        // Verificar se a conversa JÁ EXISTE
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: currentUserId } } },
                    { participants: { some: { userId: recipient.id } } }
                ],
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                messages: { orderBy: { createdAt: "asc" } }
            }
        })


        // Se já existe, apenas abrimos essa conversa! Não cria nada no banco.
        if (existingConversation) {
            return existingConversation
        }

        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: currentUserId },
                        { userId: recipient.id }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                messages: true
            }
        });

        return newConversation;
    }

    static async getMessageByConversationId(
        conversationId: string,
        userId: string,
        limit: number = 20,
        cursor?: string
    ) {

        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId,
                    conversationId
                }
            }
        })

        if (!isParticipant) {
            throw new Error("Acesso negado ou conversa não encontrada");
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor
                }
            }),
            orderBy: {
                createdAt: "desc"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;
        const sortedMessages = [...messages].reverse();

        return {
            messages: sortedMessages,
            nextCursor
        };
    }

    static async sendMessage(conversationId: string, senderId: string, content: string) {

        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId: senderId,
                    conversationId
                }
            }
        });

        if (!isParticipant) {
            throw new Error("Acesso negado ou conversa não encontrada");
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return message;
    }
}
