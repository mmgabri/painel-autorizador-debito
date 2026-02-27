import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/dashboard/acumulado-dia?data=2026-02-27
router.get('/acumulado-dia', (req: Request, res: Response) => {
  const data = (req.query['data'] as string) || new Date().toISOString().slice(0, 10);

  res.json({
    data,
    ultima_atualizacao: '14:35:22',
    volume: 8985632,
    faturamento: 450236654.85,
    pico_hora_volume: 1250430,
    pico_hora_volume_faixa: '10:00 - 11:00',
    pico_hora_faturamento: 62540318.45,
    pico_hora_faturamento_faixa: '10:00 - 11:00',
    tps_atual: 342,
    tps_atual_hora: '14:35:22',
    pico_dia: 587,
    pico_dia_hora: '10:32:15',
  });
});

// GET /api/dashboard/acumulado-a1?data=2026-02-26
router.get('/acumulado-a1', (req: Request, res: Response) => {
  const data = (req.query['data'] as string) || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  res.json({
    data,
    volume: 9123456,
    faturamento: 467891234.56,
    pico_hora_volume: 1312500,
    pico_hora_volume_faixa: '11:00 - 12:00',
    pico_hora_faturamento: 65430120.78,
    pico_hora_faturamento_faixa: '11:00 - 12:00',
    pico_dia: 612,
    pico_dia_hora: '11:15:42',
  });
});

// GET /api/dashboard/recorde
router.get('/recorde', (_req: Request, res: Response) => {
  res.json({
    record_volume: 12456789,
    record_volume_data: '2025-11-29',
    record_faturamento: 623456789.12,
    record_faturamento_data: '2025-11-29',
    record_pico_hora_volume: 1876543,
    record_pico_hora_volume_data: '2025-11-29',
    record_pico_hora_volume_faixa: '10:00 - 11:00',
    record_pico_hora_faturamento: 93827456.34,
    record_pico_hora_faturamento_data: '2025-11-29',
    record_pico_hora_faturamento_faixa: '10:00 - 11:00',
    record_tps: 823,
    record_tps_data: '2025-12-23',
    record_tps_hora: '10:45:33',
  });
});

// GET /api/dashboard/acumulado-semana?data=2026-02-27
router.get('/acumulado-semana', (req: Request, res: Response) => {
  const dataRef = (req.query['data'] as string) || new Date().toISOString().slice(0, 10);
  const refDate = new Date(dataRef + 'T12:00:00Z');

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const semana = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const diaSemana = diasSemana[d.getDay()];

    // Mock data with some variation
    const baseVolume = 7500000 + Math.floor(Math.random() * 3000000);
    const baseFaturamento = 380000000 + Math.floor(Math.random() * 150000000);

    semana.push({
      data: dateStr,
      dia_semana: diaSemana,
      volume: baseVolume,
      faturamento: baseFaturamento,
    });
  }

  res.json(semana);
});

export default router;
