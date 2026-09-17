import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Tenta fazer uma consulta simples no banco de dados para testar a conexão
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json(
      { message: "Conexão com o banco de dados bem-sucedida!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao conectar com o banco de dados:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com o banco de dados", details: error.message },
      { status: 500 }
    );
  }
}
