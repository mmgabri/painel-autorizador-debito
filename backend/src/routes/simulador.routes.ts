import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  // Sorteio ponderado:
  // 60% -> 00
  // 10% -> 14
  // 10% -> 96
  // 10% -> 51
  // 10% -> 55
  const r = Math.random(); // [0,1)

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

  // Mock: response map com field 39 variando
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

  console.log('/simulador - Simulated message:', message, '-> 39:', field39);

  res.json({
    fields: responseFields,
    message: responseMessage,
  });
});

export default router;
