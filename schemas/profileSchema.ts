import { z } from "zod"

export const userProfileSchema = z.object({
    name: z.string().optional(),
    bio: z.string().max(200, "Bio pode ter até 200 caracteres.").optional(),
    avatar: z.string().optional(),
    messageProfile: z.string().max(30, "Recado pode ter até 30 caracteres.").optional(),
    address: z.string().max(100, "Endereço pode ter até 100 caracteres.").optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
