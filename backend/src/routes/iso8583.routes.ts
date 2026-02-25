import { Router, Request, Response } from 'express';

const router = Router();

const DEFAULT_MOCK: Record<string, string> = {
  '02': '5454545454',
  '03': '0000',
  '04': '000005212',
};

const ALTERNATIVE_MOCKS: Record<string, Record<string, string>> = {
  '0200': {
    '02': '5454545454',
    '03': '003000',
    '04': '000012345',
    '11': '123456',
    '22': '051',
    '41': 'TERM0001',
    '42': 'MERCHANT000001',
  },
  '0210': {
    '02': '5454545454',
    '03': '003000',
    '04': '000012345',
    '11': '123456',
    '39': '00',
  },
  '0400': {
    '02': '5454545454',
    '03': '003000',
    '04': '000012345',
    '11': '654321',
    '37': '000000654321',
    '39': '00',
  },
};

function pickMockResponse(message: string): Record<string, string> {
  const normalized = message.toUpperCase();

  for (const [key, mock] of Object.entries(ALTERNATIVE_MOCKS)) {
    if (normalized.includes(key)) {
      return mock;
    }
  }

  return DEFAULT_MOCK;
}

router.post('/parse', (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || message.trim() === '') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const result = pickMockResponse(message);
  res.json(result);
});

router.post('/build', (req: Request, res: Response) => {
  const fields = req.body as Record<string, string> | undefined;

  if (!fields || Object.keys(fields).length === 0) {
    res.status(400).json({ error: 'fields map is required' });
    return;
  }

  // Mock build: concatenate MTI (from field structure) + field values as hex-like string
  const sortedKeys = Object.keys(fields).sort((a, b) => Number(a) - Number(b));
  let hexMessage = '0200'; // default MTI
  for (const key of sortedKeys) {
    hexMessage += fields[key];
  }

  res.json({ message: hexMessage });
});

export default router;
