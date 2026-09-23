import { api } from "@/lib/axios";

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
    }[],
    _count: {
        messages: number;
    }
}

export const getConversations = async (): Promise<TypeConversation[] | null> => {
    try {
        const response = await api.get("/conversations");
        return response.data.conversations;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const markMessageAsRead = async (conversationId: string) => {
    try {
        const response = await api.patch(`/conversations/${conversationId}/read`);
        return response.data;
    } catch (error: any) {
        console.log(error.response?.data);
        return null;
    }
}