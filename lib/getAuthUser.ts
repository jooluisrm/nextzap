import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getAuthUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    try {
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secretKey);
        return payload.userId as string;
    } catch {
        return null;
    }
}
