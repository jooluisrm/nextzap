---
name: backend-architecture-best-practices
description: Padrões de arquitetura e boas práticas comuns para backends modernos no ecossistema Node.js/Next.js.
---

# Boas Práticas e Arquitetura Backend

Este guia aborda as melhores práticas de estruturação e arquitetura backend, focando em aplicações Next.js (usando Route Handlers ou Server Actions) e integrações com banco de dados.

## 1. Arquitetura (A mais comum: Arquitetura em Camadas simplificada)
Para projetos em Next.js (e Node.js em geral), evite a complexidade extrema da Clean Architecture a menos que seja um sistema massivo. A abordagem mais pragmática e adotada é a **Arquitetura em Camadas (Layered Architecture) / MVC Moderno**:

- **Camada de Apresentação (Controllers/Routers)**:
  - Nos Route Handlers (`app/api/.../route.ts`) ou Server Actions.
  - **Responsabilidade**: Receber a requisição, validar a entrada (usando Zod), extrair os parâmetros e chamar a camada de serviço. Retornar os códigos HTTP corretos (ex: 200, 400, 500).
- **Camada de Serviço (Services/Use Cases)**:
  - Onde reside toda a **regra de negócio** (ex: `services/userService.ts`).
  - **Responsabilidade**: Executar validações de negócio, orquestrar múltiplas chamadas, gerar hashes, e fazer a ponte entre o Controller e a camada de Banco de Dados.
- **Camada de Acesso a Dados (Repositories/ORMs)**:
  - Fica abstraída pelo uso do **Prisma ORM**.
  - **Responsabilidade**: Funções que realizam consultas diretas ao banco.

## 2. Padrão de Validação e Tipagem
- **Zod**: Use o `zod` para validação de esquemas (schemas). Todo payload recebido em rotas ou server actions deve ser validado com o Zod. Ele atua como um "escudo" garantindo que dados malformados não entrem no sistema e facilita a inferência de tipos do TypeScript.
- **Error Handling (Tratamento de Erros)**:
  - Crie classes ou estruturas de erros customizados (ex: `AppError`) para separar erros de regras de negócio (ex: "Usuário já existe") de erros internos ("Falha no banco").
  - Nos Controllers/Route Handlers, use blocos `try/catch` para capturar as exceções e converter em mensagens e status HTTP corretos de forma centralizada.

## 3. Segurança e Boas Práticas
- **Senhas e Dados Sensíveis**: Nunca salve senhas em texto puro; utilize bibliotecas como `bcrypt` ou `argon2` para o hashing (hash + salt).
- **Autenticação**:
  - Para Next.js, `NextAuth.js` (ou `Auth.js`) é a solução mais completa para login social e e-mail.
  - Para JWT (JSON Web Tokens), se gerenciar manualmente, armazene preferencialmente em *HTTP-only cookies* ao invés de `localStorage` para mitigar ataques XSS.
- **Variáveis de Ambiente**: Mantenha segredos em arquivos `.env` ou `.env.local` e nunca faça commit deles. Use verificação de variáveis de ambiente no startup (ex: biblioteca `@t3-oss/env-nextjs`).

## 4. O Padrão com Prisma
- Mantenha a instância do `PrismaClient` como um singleton em `lib/prisma.ts` para evitar a exaustão de conexões em ambientes de hot-reload no modo de desenvolvimento.
- Evite espalhar chamadas brutas ao prisma (`prisma.user.findMany`) dentro dos componentes do Next.js. Concentre-as nos Server Actions ou em funções auxiliares (Camada de Serviço).
