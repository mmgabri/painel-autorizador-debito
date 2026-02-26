import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export interface ConsultaTransacao {
  correlationId: string;
  nomeProduto: string;
  status: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH
  minuto: string; // MM
  segundo: string; // SS
  valor: string;
  messageRequest: string; // hex ISO
  messageResponse: string; // hex ISO
  cartao: string;
  clearingId: string;
  situacao: string; // AUTORIZADA | CONCILIADA
}

// In-memory database
const consultaDb = new Map<string, ConsultaTransacao>();

// Seed 10 transactions on module load
function seedTransactions(): void {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const produtos = [
    'Débito Visa', 'Débito Mastercard', 'Débito Elo',
    'Crédito Visa', 'Crédito Mastercard', 'Débito Hipercard',
    'Débito Amex', 'Crédito Elo', 'Débito Visa', 'Crédito Amex',
  ];

  const statuses = ['APROVADA', 'NEGADA', 'APROVADA', 'APROVADA', 'NEGADA',
    'APROVADA', 'APROVADA', 'APROVADA', 'NEGADA', 'APROVADA'];

  const situacoes: Array<'AUTORIZADA' | 'CONCILIADA'> = [
    'AUTORIZADA', 'CONCILIADA', 'AUTORIZADA', 'CONCILIADA', 'AUTORIZADA',
    'CONCILIADA', 'AUTORIZADA', 'AUTORIZADA', 'CONCILIADA', 'AUTORIZADA',
  ];

  for (let i = 0; i < 10; i++) {
    const correlationId = randomUUID();
    const hora = String(8 + i).padStart(2, '0');
    const minuto = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const segundo = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const valor = String((Math.random() * 9999 + 1).toFixed(2));

    // Generate different mock hex ISO messages
    const msgType = i % 2 === 0 ? '0200' : '0210';
    const messageRequest = `${msgType}5899161234560088003000000${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}${correlationId.replace(/-/g, '').substring(0, 12)}`;
    const messageResponse = `${msgType}5899161234560088003000000${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}${correlationId.replace(/-/g, '').substring(0, 12)}00`;

    const transacao: ConsultaTransacao = {
      correlationId,
      nomeProduto: produtos[i],
      status: statuses[i],
      data: dateStr,
      hora,
      minuto,
      segundo,
      valor,
      messageRequest,
      messageResponse,
      cartao: '5899161234560088',
      clearingId: randomUUID(),
      situacao: situacoes[i],
    };

    consultaDb.set(correlationId, transacao);
  }

  console.log(`Seeded ${consultaDb.size} consulta transactions`);
}

// Seed on module load
seedTransactions();

const router = Router();

// GET /api/consulta/transacao - list transactions with optional filters
router.get('/transacao', (req: Request, res: Response) => {
  const cartao = (req.query['cartao'] as string | undefined) ?? '';
  const data = (req.query['data'] as string | undefined) ?? '';
  const hora = (req.query['hora'] as string | undefined) ?? '';
  const minuto = (req.query['minuto'] as string | undefined) ?? '';
  const segundo = (req.query['segundo'] as string | undefined) ?? '';

  let list = Array.from(consultaDb.values());

  if (cartao.trim() !== '') {
    list = list.filter((t) => t.cartao.includes(cartao.trim()));
  }
  if (data.trim() !== '') {
    list = list.filter((t) => t.data === data.trim());
  }
  if (hora.trim() !== '') {
    list = list.filter((t) => t.hora === hora.trim().padStart(2, '0'));
  }
  if (minuto.trim() !== '') {
    list = list.filter((t) => t.minuto === minuto.trim().padStart(2, '0'));
  }
  if (segundo.trim() !== '') {
    list = list.filter((t) => t.segundo === segundo.trim().padStart(2, '0'));
  }

  // Return only the fields needed for the list view
  const result = list.map((t) => ({
    correlationId: t.correlationId,
    nomeProduto: t.nomeProduto,
    status: t.status,
    hora: `${t.hora}:${t.minuto}:${t.segundo}`,
    valor: t.valor,
    messageRequest: t.messageRequest,
    messageResponse: t.messageResponse,
  }));

  console.log('/consulta/transacao - Found', result.length, 'transactions');
  res.json(result);
});

// GET /api/consulta/:id - get transaction details by correlationId
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const transacao = consultaDb.get(id);

  if (!transacao) {
    res.status(404).json({ error: 'Transação não encontrada' });
    return;
  }

  // Return all fields as a key/value map for dynamic rendering
  const detalhes: Record<string, string> = {
    'Cartão': transacao.cartao,
    'CorrelationId': transacao.correlationId,
    'ClearingId': transacao.clearingId,
    'Valor': transacao.valor,
    'Situação': transacao.situacao,
    'Nome Produto': transacao.nomeProduto,
    'Status': transacao.status,
    'Data': transacao.data,
    'Hora': `${transacao.hora}:${transacao.minuto}:${transacao.segundo}`,
    'Message ISO Request': transacao.messageRequest,
    'Message ISO Response': transacao.messageResponse,
  };

  console.log('/consulta/' + id, '- Found transaction:', transacao.nomeProduto);
  res.json(detalhes);
});

export default router;
