import { UserProfile } from "@/types/type-profile";
import { api } from "@/lib/axios"
import { UserProfileInput } from "@/schemas/profileSchema";

type TypeProfileResponse = {
    profile: UserProfile;
}

export const getProfileUser = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;

    try {
        const result = await api.get<TypeProfileResponse>(`/profile/${userId}`)
        return result.data.profile;
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
    }
}

export const updateProfileUser = async (data: UserProfileInput): Promise<UserProfile | string> => {
    try {
        const result = await api.patch("/profile", data);
        return result.data.profile;
    } catch (error: any) {
        return error.response.data.message;
    }
}
