import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Obter o cookie auth_token enviado pelo navegador
    const token = request.cookies.get('auth_token')?.value
    let isAuthenticated = false

    // Verificar a validade do token JWT com a biblioteca 'jose'
    if (token) {
        try {
            const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!)
            await jwtVerify(token, secretKey)
            isAuthenticated = true
        } catch (error) {
            // Token expirado ou inválido
            isAuthenticated = false
        }
    }
    const isPublicRoute = publicRoutes.includes(pathname)

    // 1. Se NÃO estiver autenticado e tentar acessar rota privada (ex: /message)
    if (!isAuthenticated && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    // 2. Se JÁ estiver autenticado e tentar acessar rota pública (ex: /login ou /register)
    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL('/message', request.url))
    }
    return NextResponse.next()
}

// Configuração de quais rotas o Middleware deve rodar
export const config = {
    matcher: [
        /*
         * Intercepta todas as rotas exceto:
         * - api/ (para não bloquear requisições da própria API se não quiser)
         * - _next/static (arquivos estáticos)
         * - _next/image (otimização de imagem)
         * - favicon.ico, imagens, etc.
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}