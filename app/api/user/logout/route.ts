import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookiesStore = await cookies();

    cookiesStore.delete("auth_token");

    return NextResponse.json({ message: "Logout realizado com sucesso!" }, { status: 200 });
}