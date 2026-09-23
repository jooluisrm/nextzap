import { ProfileService } from "@/backend/services/profileServices";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextRequest, NextResponse } from "next/server";

type TypeContextRoute = {
    params: Promise<{ userId: string }>
}

export async function GET(request: NextRequest, context: TypeContextRoute) {
    try {
        const currentUserId = await getAuthUserId();
        if (!currentUserId) {
            return NextResponse.json({ message: "Usuario nao autenticado." }, { status: 401 });
        }

        const { userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ message: "Id do usuario nao identificado." }, { status: 400 });
        }

        const profile = await ProfileService.getProfile(userId);

        if (!profile) {
            return NextResponse.json({ message: "Perfil nao encontrado." }, { status: 404 });
        }

        return NextResponse.json({ profile }, { status: 200 });


    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return NextResponse.json(
            { message: "Erro ao buscar perfil." },
            { status: 500 }
        );
    }
}