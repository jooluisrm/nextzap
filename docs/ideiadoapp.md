nome alterado para NextZap
# Whispr — Realtime E2E Encrypted Chat App

> Documento de Contexto Principal e Especificação Técnica do Projeto.

---

## 📌 Visão Geral do Projeto
O **Whispr** é um sistema de mensagens instantâneas estilo WhatsApp, desenvolvido como um projeto de estudos prático. O objetivo central é dominar a arquitetura de **comunicação em tempo real (WebSockets)** integrada ao ecossistema **Next.js**, combinada com **Criptografia de Ponta a Ponta (E2EE - End-to-End Encryption)** executada de forma nativa no navegador do usuário.

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Descrição / Papel |
| :--- | :--- | :--- |
| **Framework Fullstack** | **Next.js (App Router)** | Frontend React + API Routes (Backend Serverless) |
| **Estilização** | **Tailwind CSS** | Interface moderna, responsiva e componentes reutilizáveis |
| **Serviço de Realtime** | **Pusher** / **Supabase Realtime** | Camada gerenciada de WebSockets para trafegar mensagens em tempo real |
| **Criptografia** | **Web Crypto API (Browser)** | Geração de chaves assimétricas, encriptação e decriptação no cliente |
| **Banco de Dados** | **PostgreSQL (via Prisma / Supabase)** | Armazenamento de usuários, chaves públicas e mensagens cifradas |

---

## 🛠️ Arquitetura do Sistema

### 1. Comunicação em Tempo Real (Realtime)
Para contornar o modelo efêmero/serverless do Next.js sem precisar manter um servidor Node.js dedicado rodando 24/7:
1. O **Remetente** envia uma requisição `POST` com a mensagem criptografada para uma API Route do Next.js.
2. O **Next.js** salva a mensagem cifrada no banco de dados PostgreSQL.
3. O **Next.js** dispara um evento para a API do **Pusher / Supabase Realtime**.
4. O **Pusher / Supabase** retransmite o evento instantaneamente via **WebSocket** para o **Destinatário**.

### 2. Criptografia de Ponta a Ponta (E2EE)
Garantia de privacidade no modelo *Zero-Knowledge* (o banco de dados e o servidor nunca possuem acesso ao texto legível).

```
[ Usuário A (Maria) ]                           [ Servidor / DB ]                         [ Usuário B (João) ]
         |                                             |                                           |
 1. Gera Chave Pública & Privada                      |                                  1. Gera Chave Pública & Privada
         |---------------- Envia Chave Pública ------->|                                           |
         |                                             |<------- Envia Chave Pública --------------|
         |                                             |                                           |
 2. Pega Chave Pública do João <-----------------------|                                           |
 3. Encripta "Oi" no Browser                          |                                           |
 4. Envia payload cifrado "a8f9z..." ----------------->|                                           |
         |                                             | 5. Notifica via WebSocket                 |
         |                                             |------------------------------------------>|
         |                                             |                                  6. Decripta com sua Chave Privada
```

---

## 🗄️ Estrutura do Banco de Dados (Modelos Iniciais)

```prisma
model User {
  id               String    @id @default(uuid())
  name             String
  email            String    @unique
  publicKey        String    // Chave pública (JWK/PEM) para outros usuários criptografarem mensagens
  createdAt        DateTime  @default(now())
  
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}

model Message {
  id               String   @id @default(uuid())
  senderId         String
  receiverId       String
  encryptedContent String   // Texto cifrado (Base64) - indeferível no banco
  createdAt        DateTime @default(now())

  sender           User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver         User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
}
```


## 📝 Padronização de Commits
Seguir rigorosamente o padrão de commits semânticos estabelecido para o projeto:

**Padrão:**
- `feat:` Inclusão de nova funcionalidade
- `ui:` Alterações de interface, componentes visuais e estilização
- `fix:` Correção de bugs
- `refactor:` Melhorias de código sem alterar regra de negócio

**Exemplos:**
```bash
feat: criar tela de login com responsividade, imagem de fundo e efeito de blur
- Estrutura com componentes reutilizáveis: MainLogin, ContainerLogin, InputLogin e ButtonLogin
- Estilização com imagem de fundo, overlay escuro e card com blur
- Inclusão de troca de página para recuperação de senha

ui: melhorar mensagem condicional de troca entre login e recuperação de senha
```