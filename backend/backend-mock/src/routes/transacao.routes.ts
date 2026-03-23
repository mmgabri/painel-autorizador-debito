import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export interface Transacao {
  id: string;
  nomeProduto: string;
  tag: string;
  descricao: string;
  mensagemIso: string;
  criadoEm: string;
}

// In-memory database
export const transacoes = new Map<string, Transacao>();

const router = Router();

router.post('/salvar', (req: Request, res: Response) => {
  const { id: existingId, nomeProduto, tag, descricao, mensagemIso } = req.body as {
    id?: string;
    nomeProduto?: string;
    tag?: string;
    descricao?: string;
    mensagemIso?: string;
  };

  if (!nomeProduto || nomeProduto.trim() === '') {
    res.status(400).json({ error: 'nomeProduto is required' });
    return;
  }

  if (!tag || tag.trim() === '') {
    res.status(400).json({ error: 'tag is required' });
    return;
  }

  if (!mensagemIso || mensagemIso.trim() === '') {
    res.status(400).json({ error: 'mensagemIso is required' });
    return;
  }

  // If id is provided and exists, update the existing record
  if (existingId && transacoes.has(existingId)) {
    const existing = transacoes.get(existingId)!;
    existing.nomeProduto = nomeProduto.trim();
    existing.tag = tag.trim();
    existing.descricao = (descricao ?? '').trim();
    existing.mensagemIso = mensagemIso.trim();
    transacoes.set(existingId, existing);
    console.log('/transacao/salvar - Updated transaction:', existingId, existing.nomeProduto);
    res.json({ id: existingId, message: 'Transação atualizada com sucesso' });
    return;
  }

  // Otherwise create a new record
  const id = randomUUID();
  const transacao: Transacao = {
    id,
    nomeProduto: nomeProduto.trim(),
    tag: tag.trim(),
    descricao: (descricao ?? '').trim(),
    mensagemIso: mensagemIso.trim(),
    criadoEm: new Date().toISOString(),
  };

  transacoes.set(id, transacao);
  console.log('/transacao/salvar - Created transaction:', id, transacao.nomeProduto);

  res.json({ id, message: 'Transação salva com sucesso' });
});

// GET /api/transacao/consultar - list all or filter by nomeProduto
router.get('/consultar', (req: Request, res: Response) => {
  const filtroNome = (req.query['nomeProduto'] as string | undefined) ?? '';
  const filtroTag = (req.query['tag'] as string | undefined) ?? '';
  let list = Array.from(transacoes.values());

  if (filtroNome.trim() !== '') {
    const lower = filtroNome.trim().toLowerCase();
    list = list.filter((t) => t.nomeProduto.toLowerCase().includes(lower));
  }

  if (filtroTag.trim() !== '') {
    const lower = filtroTag.trim().toLowerCase();
    list = list.filter((t) => t.tag.toLowerCase().includes(lower));
  }

  console.log('/transacao/consultar - Found', list.length, 'transactions', filtroNome ? `(nome: ${filtroNome})` : '', filtroTag ? `(tag: ${filtroTag})` : '');
  res.json(list);
});

// DELETE /api/transacao/excluir/:id - delete a transaction by id
router.delete('/excluir/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!transacoes.has(id)) {
    res.status(404).json({ error: 'Transação não encontrada' });
    return;
  }

  transacoes.delete(id);
  console.log('/transacao/excluir - Deleted transaction:', id);
  res.json({ message: 'Transação excluída com sucesso' });
});

// POST /api/transacao/executar - simulate transaction (moved from /api/simulador)
router.post('/executar', (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const r = Math.random();

  let field39 = '00';
  let responseMessage = 'Transação autorizada com sucesso';

  if (r < 0.60) {
    field39 = '00';
    responseMessage = 'Transação autorizada com sucesso';
  } else if (r < 0.70) {
    field39 = '14';
    responseMessage = 'Cartão invalido';
  } else if (r < 0.80) {
    field39 = '96';
    responseMessage = 'timeout gateway mainframe - cr1';
  } else if (r < 0.90) {
    field39 = '51';
    responseMessage = 'Saldo indisponivel';
  } else {
    field39 = '55';
    responseMessage = 'Senha invalida';
  }

  const responseFields: Record<string, string> = {
    '02': '5454545454',
    '03': '003000',
    '04': '000012345',
    '11': '123456',
    '22': '051',
    '39': field39,
    '41': 'TERM0001',
    '42': 'MERCHANT000001',
  };

  console.log('/transacao/executar - Simulated message:', message, '-> 39:', field39);

  res.json({
    fields: responseFields,
    message: responseMessage,
  });
});

router.get('/', (_req: Request, res: Response) => {
  const list = Array.from(transacoes.values());
  res.json(list);
});

export default router;
