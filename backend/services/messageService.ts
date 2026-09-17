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
}