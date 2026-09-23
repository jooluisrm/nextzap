import { ProfileService } from "@/backend/services/profileServices";
import { getAuthUserId } from "@/lib/getAuthUser";
import { userProfileSchema } from "@/schemas/profileSchema";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
    try {
        const currentUserId = await getAuthUserId();
        if (!currentUserId) {
            return NextResponse.json({ message: "Usuario não autenticado." }, { status: 401 });
        }

        const body = await request.json();

        const validation = await userProfileSchema.safeParseAsync(body);

        if (!validation.success) {
            const firstErrorMessage = validation.error.issues[0]?.message || "Dados inválidos.";
            return NextResponse.json({ message: firstErrorMessage }, { status: 400 });
        }

        const updatedProfile = await ProfileService.updateProfile(currentUserId, validation.data);

        return NextResponse.json({ profile: updatedProfile }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return NextResponse.json(
            { message: "Erro ao atualizar perfil." },
            { status: 500 }
        );
    }
}