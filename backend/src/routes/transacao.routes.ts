import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';

interface Transacao {
  id: string;
  nomeProduto: string;
  descricao: string;
  mensagemIso: string;
  criadoEm: string;
}

// In-memory database
const transacoes = new Map<string, Transacao>();

const router = Router();

router.post('/salvar', (req: Request, res: Response) => {
  const { nomeProduto, descricao, mensagemIso } = req.body as {
    nomeProduto?: string;
    descricao?: string;
    mensagemIso?: string;
  };

  if (!nomeProduto || nomeProduto.trim() === '') {
    res.status(400).json({ error: 'nomeProduto is required' });
    return;
  }

  if (!mensagemIso || mensagemIso.trim() === '') {
    res.status(400).json({ error: 'mensagemIso is required' });
    return;
  }

  const id = randomUUID();
  const transacao: Transacao = {
    id,
    nomeProduto: nomeProduto.trim(),
    descricao: (descricao ?? '').trim(),
    mensagemIso: mensagemIso.trim(),
    criadoEm: new Date().toISOString(),
  };

  transacoes.set(id, transacao);
  console.log('/transacao/salvar - Saved transaction:', id, transacao.nomeProduto);

  res.json({ id, message: 'Transação salva com sucesso' });
});

router.get('/', (_req: Request, res: Response) => {
  const list = Array.from(transacoes.values());
  res.json(list);
});

export default router;
