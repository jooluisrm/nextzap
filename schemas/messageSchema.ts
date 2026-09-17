import { z } from "zod"

export const newMessageSchema = z.object({
    email: z.string().email("Email inválido"),
})

export type NewMessageInput = z.infer<typeof newMessageSchema>