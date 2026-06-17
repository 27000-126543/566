import { Router, type Request, type Response } from 'express';
import * as announcementService from '../services/announcementService.js';
import { ValidationError } from '../validators/index.js';

const router = Router();

router.get('/guilds/:guildId/announcements', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const result = await announcementService.getAnnouncementsByGuildId(guildId);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/guilds/:guildId/announcements', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const { title, content, authorId } = req.body;
    const result = await announcementService.createAnnouncement(
      guildId,
      title,
      content,
      authorId
    );
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
