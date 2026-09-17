import { z } from "zod"

export const newMessageSchema = z.object({
    email: z.string().email("Email inválido"),
});

export const sendMessageSchema = z.object({
    conversationId: z.string(),
    content: z.string().min(1, "Mensagem não pode estar vazia"),
});

export type NewMessageInput = z.infer<typeof newMessageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;