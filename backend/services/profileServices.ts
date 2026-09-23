import { prisma } from "@/lib/prisma";
import { UserProfileInput } from "@/schemas/profileSchema";

export class ProfileService {
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }, select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                avatar: true,
                address: true,
                bio: true,
                messageProfile: true
            }
        });
        return user;
    }

    static async updateProfile(currentUserId: string, data: UserProfileInput) {
        return await prisma.user.update({
            where: {
                id: currentUserId
            },
            data: {
                ...data
            }, select: {
                id: true,
                name: true,
                avatar: true,
                address: true,
                bio: true,
                messageProfile: true
            }
        });
    }
}