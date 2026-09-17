import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const conversationId1 = "731ea6bd-18be-407b-98cc-9c1989bc7909";
  const user1 = "f775129a-96cc-4775-a0ae-2ccd5f91363f"; // Teste
  const user2 = "2b7faf94-d1e5-4068-9a3f-b549f3694de5"; // assaoksao

  const conversationId2 = "8bba85dd-4f1b-4b81-9342-286973a42409";
  const user3 = "81bffa45-d305-476f-beaf-1c4e9c852f82"; // João Luís

  console.log("Iniciando inserção de mensagens de teste...");

  const sampleMessagesConv1 = [
    { senderId: user1, content: "Olá! Tudo bem com você?" },
    { senderId: user2, content: "Opa, tudo ótimo por aqui! E com você?" },
    { senderId: user1, content: "Tudo certo! Vi que você começou a usar o NextZap." },
    { senderId: user2, content: "Sim! A interface está ficando muito boa estilo WhatsApp." },
    { senderId: user1, content: "Verdade, agora já estamos listando as conversas e enviando mensagens." },
    { senderId: user2, content: "Que massa! E já temos suporte a Prisma e banco PostgreSQL?" },
    { senderId: user1, content: "Sim, tudo integrado com Next.js App Router." },
    { senderId: user2, content: "Sensacional. Vamos implementar o envio de mensagens pelo chat agora?" },
    { senderId: user1, content: "Com certeza, esse é o próximo passo!" },
    { senderId: user2, content: "Fechado! Qualquer coisa me chama por aqui." },
  ];

  let now = Date.now() - 1000 * 60 * 10; // 10 minutos atrás

  for (const msg of sampleMessagesConv1) {
    now += 1000 * 60; // Avança 1 minuto por mensagem
    await prisma.message.create({
      data: {
        conversationId: conversationId1,
        senderId: msg.senderId,
        content: msg.content,
        createdAt: new Date(now),
      },
    });
  }

  // Atualiza updatedAt da conversa
  await prisma.conversation.update({
    where: { id: conversationId1 },
    data: { updatedAt: new Date() },
  });

  // Inserir mensagens na conversa 2 também
  const sampleMessagesConv2 = [
    { senderId: user3, content: "Fala parceiro, tranquilo?" },
    { senderId: user1, content: "Tranquilo demais João!" },
  ];

  for (const msg of sampleMessagesConv2) {
    await prisma.message.create({
      data: {
        conversationId: conversationId2,
        senderId: msg.senderId,
        content: msg.content,
      },
    });
  }

  await prisma.conversation.update({
    where: { id: conversationId2 },
    data: { updatedAt: new Date() },
  });

  console.log("10 mensagens inseridas com sucesso na conversa 1 e 2 na conversa 2!");
}

main()
  .catch((e) => {
    console.error("Erro ao inserir mensagens:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
