import express from 'express';
import cors from 'cors';
import iso8583Routes from './routes/iso8583.routes.js';
import simuladorRoutes from './routes/simulador.routes.js';

const app = express();
const PORT = process.env['PORT'] ?? 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/iso8583', iso8583Routes);
app.use('/api/simulador', simuladorRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
