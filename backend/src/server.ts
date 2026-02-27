import express from 'express';
import cors from 'cors';
import iso8583Routes from './routes/iso8583.routes.js';
// simulador routes moved into transacao routes as /api/transacao/executar
import transacaoRoutes from './routes/transacao.routes.js';
import consultaRoutes from './routes/consulta.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
const PORT = process.env['PORT'] ?? 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/iso8583', iso8583Routes);
// /api/simulador removed - now at /api/transacao/executar
app.use('/api/transacao', transacaoRoutes);
app.use('/api/consulta', consultaRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
