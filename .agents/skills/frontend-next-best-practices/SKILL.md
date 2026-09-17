---
name: frontend-next-best-practices
description: Boas práticas e padrões comuns para o desenvolvimento frontend com Next.js e React.
---

# Boas Práticas Frontend (Next.js & React)

Este guia define as práticas mais comuns e recomendadas pelo mercado para desenvolvimento com Next.js (App Router) e React.

## 1. Arquitetura e Estrutura de Pastas (App Router)
- **app/**: Apenas para rotas (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`). Não coloque componentes genéricos aqui.
- **components/**: Componentes reutilizáveis da interface (ex: botões, modais, cards).
  - Pode ser dividido em `ui/` (componentes burros/visuais genéricos) e `features/` (componentes atrelados a regras de negócio).
- **lib/**: Funções utilitárias, configurações de bibliotecas externas (ex: `prisma.ts`, `axios.ts`, `utils.ts`).
- **hooks/**: Custom hooks (ex: `useUser`, `useDebounce`).
- **types/** ou **interfaces/**: Definições de tipos globais (TypeScript).
- **actions/** ou **server-actions/**: Server Actions do Next.js (funções executadas exclusivamente no servidor).

## 2. Padrões de Componentes
- **Client vs Server Components**:
  - Por padrão, todos os componentes no `app/` são **Server Components**. Eles têm acesso direto a banco de dados e arquivos locais. Não possuem interatividade (estado, hooks).
  - Use a diretiva `"use client"` **apenas** onde for estritamente necessário (ex: componentes que precisam de `useState`, `useEffect`, `onClick`).
  - Mantenha os Client Components o mais nas "folhas" (bordas) da árvore de componentes possível, passando dados pré-processados pelo servidor via props.

## 3. Gerenciamento de Estado
- **Estado Local**: Use `useState` para estados isolados do componente.
- **Estado Global/Complexo**: Use `Zustand` ou a Context API do React para estados globais (como carrinho de compras, usuário autenticado). Zustand é atualmente o mais recomendado por ser leve e fácil de usar.
- **Estado do Servidor (Data Fetching no Client)**: Use `React Query` (`@tanstack/react-query`) ou `SWR` para chamadas de API no lado do cliente (mutations, caching, revalidação).
- **Data Fetching no Servidor**: Em Server Components, use fetch nativo com async/await. Não há necessidade de useEffect para buscar dados!

## 4. Estilização
- **Tailwind CSS**: Padrão da indústria para Next.js. Use classes utilitárias diretamente nos componentes.
- **Utilitário `cn()`**: Use uma combinação de `clsx` + `tailwind-merge` para combinar classes condicionalmente de forma limpa.

## 5. Performance
- **Imagens**: Sempre use o componente `<Image />` do `next/image` para otimização automática.
- **Fontes**: Use o `next/font` para carregar fontes (ex: Google Fonts) no tempo de build e evitar layout shift (CLS).
- **Links**: Use `<Link>` do `next/link` para navegação SPA (Single Page Application) e pre-fetching de rotas.
