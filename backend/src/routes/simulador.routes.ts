import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  // Mock: parse the hex message and return a response map with field 39 = "00"
  const responseFields: Record<string, string> = {
    '02': '5454545454',
    '03': '003000',
    '04': '000012345',
    '11': '123456',
    '22': '051',
    '39': '00',
    '41': 'TERM0001',
    '42': 'MERCHANT000001',
  };

  res.json({
    fields: responseFields,
    message: 'Transação autorizada com sucesso',
  });
});

export default router;
