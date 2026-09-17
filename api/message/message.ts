import { api } from "@/lib/axios"


type CreateNewContactResponse = {
    conversation: {
        id: string;
        createdAt: string;
        updatedAt: string;
        participants: {
            id: string;
            userId: string;
            conversationId: string;
            joinedAt: string;
            lastReadAt: string | null;
            user: {
                id: string;
                name: string;
                email: string;
            };
        }[];
        messages: {
            id: string;
            conversationId: string;
            senderId: string;
            content: string;
            readAt: string | null;
            createdAt: string;
        }[];
    } | null;
    message: string;
    status?: number;
}

export const createNewContact = async (email: string): Promise<CreateNewContactResponse> => {
    try {
        const response = await api.post("/message/new", {
            email
        })
        return response.data;
    } catch (error: any) {
        return { conversation: null, message: error.response.data.message, status: error.response.status };
    }
}