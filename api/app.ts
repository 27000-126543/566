import express, {
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import guildRoutes from './routes/guild.js';
import questRoutes from './routes/quests.js';
import warehouseRoutes from './routes/warehouse.js';
import announcementRoutes from './routes/announcements.js';

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api', questRoutes);
app.use('/api', warehouseRoutes);
app.use('/api', announcementRoutes);

app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    });
  },
);

app.use((error: Error, req: Request, res: Response): void => {
  res.status(500).json({
    success: false,
    error: '服务器错误',
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  });
});

export default app;
