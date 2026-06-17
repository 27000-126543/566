import { Router, type Request, type Response } from 'express';
import * as guildLogService from '../services/guildLogService.js';
import { ValidationError } from '../validators/index.js';

const router = Router();

router.get('/:guildId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: '缺少用户ID参数' });
      return;
    }
    const result = await guildLogService.getGuildLogs(guildId, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

export default router;
