import { api } from "@/lib/axios";
import { LoginInput, RegisterInput } from "@/schemas/userSchema";
import { TypeUser } from "@/types/type-user";

export async function registerUser(data: RegisterInput) {
    try {
        const response = await api.post("/user/register", data)

        return response.data;
    } catch (error: any) {
        return { message: error.response.data.message, status: error.response.status };
    }
}

type LoginResponse = {
    user?: TypeUser;
    message: string;
    status?: number;
}

export const loginUser = async (data: LoginInput): Promise<LoginResponse> => {
    try {
        const response = await api.post("/user/login", data)
        return response.data
    } catch (error: any) {
        return { message: error.response.data.message, status: error.response.status };
    }
}

export const logoutUser = async () => {
    try {
        await api.post('/user/logout');
    } catch (error) {
        console.log("Erro ao fazer logout", error);
    }
}

