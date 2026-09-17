import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const conversationId = "596df336-1373-446b-9ce9-f17b1324f620";

  console.log(`Buscando a conversa ${conversationId}...`);
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!conversation) {
    console.error("Conversa não encontrada!");
    process.exit(1);
  }

  if (conversation.participants.length < 2) {
    console.error("A conversa precisa de pelo menos 2 participantes!");
    process.exit(1);
  }

  const p1 = conversation.participants[0].userId;
  const p2 = conversation.participants[1].userId;
  const name1 = conversation.participants[0].user.name || "Participante 1";
  const name2 = conversation.participants[1].user.name || "Participante 2";

  console.log(`Participantes encontrados: ${name1} (${p1}) e ${name2} (${p2})`);

  // Lista de diálogos / tópicos realistas para totalizar ~100 mensagens
  const dialogTemplates: { from: number; text: string }[] = [
    // --- Tópico 1: Boas-vindas e início de projeto (Há ~30 dias) ---
    { from: 1, text: "Fala! Beleza? Tô começando a estruturar o projeto do NextZap aqui." },
    { from: 2, text: "Opa, beleza! Que show. Vai usar Next.js 15 e React 19 no frontend?" },
    { from: 1, text: "Com certeza! TailwindCSS pra estilização e Shadcn UI pra alguns componentes." },
    { from: 2, text: "Boa! E o backend, vai ser com Server Actions ou rotas de API convencionais?" },
    { from: 1, text: "Tô usando API Routes com Next.js App Router e Prisma ORM pra interagir com o PostgreSQL." },
    { from: 2, text: "Show de bola. Como tá o progresso da modelagem do banco?" },
    { from: 1, text: "Criei as tabelas User, Conversation, ConversationParticipant e Message." },
    { from: 2, text: "Ficou top! Já dá pra simular a troca de mensagens então." },
    { from: 1, text: "Sim! inclusive tô testando a paginação e a rolagem pro topo." },
    { from: 2, text: "Massa. Precisa de ajuda com alguma tela?" },

    // --- Tópico 2: Interface e layout estilo WhatsApp (Há ~25 dias) ---
    { from: 1, text: "Tô ajustando o layout da lista de conversas do lado esquerdo." },
    { from: 2, text: "Tá ficando igualzinho ao WhatsApp Web?" },
    { from: 1, text: "Sim, coloquei busca por nome, avatares e prévia da última mensagem." },
    { from: 2, text: "Que legal. E o estado de 'lida' / 'não lida'?" },
    { from: 1, text: "Adicionei o campo `readAt` na tabela Message e `lastReadAt` nos participantes." },
    { from: 2, text: "Perfeito, assim dá pra calcular o badge com a quantidade de msgs pendentes!" },
    { from: 1, text: "Exato. Também coloquei o visual dark mode por padrão." },
    { from: 2, text: "Dark mode é essencial haha. Ninguém merece luz branca na cara à noite." },
    { from: 1, text: "Verdade pura! Vou fazer uns testes de responsividade agora." },
    { from: 2, text: "Fechado, me avisa se encontrar algum bug visual no mobile." },

    // --- Tópico 3: Autenticação e Segurança (Há ~20 dias) ---
    { from: 2, text: "Ei, como ficou o esquema de autenticação dos usuários?" },
    { from: 1, text: "Temos login e cadastro funcionando com hash de senha." },
    { from: 2, text: "Massa. E no futuro pensamos em Criptografia de Ponta a Ponta (E2EE)?" },
    { from: 1, text: "Sim! Já deixei o campo `publicKey` preparado na modelagem do banco." },
    { from: 2, text: "Muito visionário! Com isso a gente consegue gerar as chaves de sessão no browser." },
    { from: 1, text: "Isso aí. O backend só recebe a cifra, nem consegue ler se quisesse." },
    { from: 2, text: "Segurança em primeiro lugar sempre. Excelente escolha." },
    { from: 1, text: "Com certeza. Amanhã vou focar na parte de WebSockets / polling." },
    { from: 2, text: "Tranquilo! Bom descanso por hoje." },
    { from: 1, text: "Valeu, pra você também!" },

    // --- Tópico 4: Performance e Paginação de Mensagens (Há ~15 dias) ---
    { from: 1, text: "Bom dia! Cara, me deparei com uma questão de performance." },
    { from: 2, text: "Opa, bom dia! O que houve?" },
    { from: 1, text: "Se a conversa tiver mil mensagens, carregar tudo de uma vez pesa o cliente." },
    { from: 2, text: "Faz sentido. Dá pra implementar paginação usando cursor-based pagination!" },
    { from: 1, text: "Pensei exatamente nisso! Carregar de 20 em 20 ou 50 em 50 conforme sobe o scroll." },
    { from: 2, text: "Isso! `take: 20`, `cursor: { id: firstMessageId }`, `skip: 1`." },
    { from: 1, text: "Exatamente esse fluxo que estou codificando no `messageService.ts`." },
    { from: 2, text: "Boa! Lembra de ordenar invertido no banco pra pegar as mais recentes primeiro." },
    { from: 1, text: "Sim, `orderBy: { createdAt: 'desc' }` e no frontend a gente inverte pra exibir." },
    { from: 2, text: "Perfeito. Vai ficar super fluido." },

    // --- Tópico 5: Ajustes finos no CSS e UX (Há ~10 dias) ---
    { from: 2, text: "Testei a rolagem automática quando chega mensagem nova." },
    { from: 1, text: "E aí, funcionou legal?" },
    { from: 2, text: "Ficou ótimo! Mas se o usuário estiver lendo mensagens antigas lá em cima, ele não deve ser forçado pro fundo." },
    { from: 1, text: "Bem observado! Posso adicionar um botão tipo 'Mensagens não lidas abaixo' com seta pra baixo." },
    { from: 2, text: "Isso seria sensacional! Muito útil em grupos e conversas ativas." },
    { from: 1, text: "Vou implementar esse controle de scroll ref no React." },
    { from: 2, text: "Top! E a formatação da hora nas bolhas de mensagem?" },
    { from: 1, text: "Tô usando `date-fns` pra formatar como `HH:mm` e agrupar por dia (Hoje, Ontem, etc)." },
    { from: 2, text: "Excelente detalhe de UX!" },
    { from: 1, text: "Valeu! Detalhes fazem toda a diferença." },

    // --- Tópico 6: Testes com Banco e Seed Data (Há ~5 dias) ---
    { from: 1, text: "E aí! Preciso gerar um histórico grande de mensagens pra testar a rolagem infinita." },
    { from: 2, text: "Dá pra criar um script de seed no Prisma pra popular a base!" },
    { from: 1, text: "Sim! Vou rodar um script que gera mensagens distribuídas ao longo dos últimos 30 dias." },
    { from: 2, text: "Massa, assim a gente testa a ordenação cronológica direitinho." },
    { from: 1, text: "Exato, com datas progressivas até o dia de hoje." },
    { from: 2, text: "Show! Quantas mensagens vai inserir?" },
    { from: 1, text: "Umas 100 mensagens distribuídas em vários dias." },
    { from: 2, text: "Boa, dá um volume perfeito pra testar o scroll e a paginação." },
    { from: 1, text: "Vou rodar aqui no banco PostgreSQL." },
    { from: 2, text: "Fechado, me fala assim que terminar." },

    // --- Tópico 7: Recursos Adicionais e Áudio/Mídia (Há ~3 dias) ---
    { from: 2, text: "Pensou em suporte a envio de imagens e áudio no chat?" },
    { from: 1, text: "Sim! Na v2 podemos ter upload via MinIO/S3 e gravador de voz Web Audio API." },
    { from: 2, text: "Vai ficar muito completo!" },
    { from: 1, text: "Com certeza. Por enquanto o foco é garantir que o envio de texto e atualização de estado fiquem 100% sólidos." },
    { from: 2, text: "Certíssimo, MVP bem feito é a chave." },
    { from: 1, text: "Além disso, a integração com o Prisma Studio tá ajudando demais no debug." },
    { from: 2, text: "O Prisma Studio é uma mão na roda mesmo pra ver o estado da base." },
    { from: 1, text: "Total! Consigo conferir o timestamps e relutância de dados em tempo real." },
    { from: 2, text: "Demais!" },
    { from: 1, text: "Continuo trabalhando aqui no código." },

    // --- Tópico 8: Status de Conexão e Realtime (Há ~1 dia) ---
    { from: 2, text: "Como tá a sensação do app no geral?" },
    { from: 1, text: "Muito boa! As mensagens entram lisas e a busca de conversas responde rápido." },
    { from: 2, text: "Sensacional! E a transição de rotas no Next.js?" },
    { from: 1, text: "O App Router tá mandando muito bem, sem re-render desnecessário na barra lateral." },
    { from: 2, text: "Que massa. O isolamento de componentes valeu a pena." },
    { from: 1, text: "Com certeza, dividi tudo em componentes limpos e reutilizáveis." },
    { from: 2, text: "Muitos anos de boas práticas aí envolvidos!" },
    { from: 1, text: "Haha sim, mantendo o código sustentável pra futuras features." },
    { from: 2, text: "Mandou bem demais!" },
    { from: 1, text: "Valeu pelo suporte no teste dos fluxos!" },

    // --- Tópico 9: Hoje (Mensagens Recentes) ---
    { from: 1, text: "Bom dia! Hoje é o dia de finalizar a verificação do histórico completo." },
    { from: 2, text: "Bom dia! Legal, as 100 mensagens estão todas ordenadas por data e hora?" },
    { from: 1, text: "Sim! Criadas desde o mês passado até os minutos de agora." },
    { from: 2, text: "Perfeito! A timeline ficou contínua e coerente." },
    { from: 1, text: "Sim, tudo no schema de mensagens mantendo a integridade referencial." },
    { from: 2, text: "Tudo pronto pra validar a paginação no frontend!" },
    { from: 1, text: "Exatamente. Se scrollar pra cima, ele carrega as msgs mais antigas." },
    { from: 2, text: "Que conquista incrível pro projeto NextZap!" },
    { from: 1, text: "Obrigado! Vamos continuar evoluindo." },
    { from: 2, text: "Bora pra cima! 🚀" },
  ];

  console.log(`Inserindo ${dialogTemplates.length} mensagens na conversa ${conversationId}...`);

  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
  const totalMsgs = dialogTemplates.length;
  const timeStep = (now.getTime() - startDate.getTime()) / totalMsgs;

  for (let i = 0; i < totalMsgs; i++) {
    const msg = dialogTemplates[i];
    const senderId = msg.from === 1 ? p1 : p2;
    const msgTime = new Date(startDate.getTime() + i * timeStep);

    await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: senderId,
        content: msg.text,
        createdAt: msgTime,
        readAt: i < totalMsgs - 2 ? msgTime : null, // As últimas duas como não lidas pra testar
      },
    });
  }

  // Atualiza updatedAt da conversa para o horário atual
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  console.log(`✅ Sucesso! ${totalMsgs} mensagens inseridas em ordem cronológica na conversa ${conversationId}.`);
}

main()
  .catch((e) => {
    console.error("Erro ao inserir mensagens:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
