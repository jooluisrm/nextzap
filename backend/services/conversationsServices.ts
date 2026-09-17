import { prisma } from "@/lib/prisma";

export class ConversationService {
    static async getConversation(currentUserId: string) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: currentUserId
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
                            }
                        }
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                }
            }
        })

        return conversations;
    }


}