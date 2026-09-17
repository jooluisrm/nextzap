export type TypeConversation = {
    id: string;
    createdAt: string;
    updatedAt: string;
    participants: [
        {
            id: string;
            userId: string;
            conversationId: string;
            joinedAt: string;
            lastReadAt: string | null;
            user: {
                id: string;
                name: string;
                email: string;
            }
        },
    ],
    messages: {
        id: string;
        conversationId: string;
        senderId: string;
        content: string;
        readAt: string | null;
        createdAt: string;
    }[]
}

export const getConversations = async (): Promise<TypeConversation[] | null> => {
    try {
        const response = await fetch("/api/conversations");
        const data = await response.json();
        return data.conversations;
    } catch (error) {
        console.log(error);
        return null;
    }
}