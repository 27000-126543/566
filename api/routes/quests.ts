import { Router, type Request, type Response } from 'express';
import * as questService from '../services/questService.js';
import { ValidationError } from '../validators/index.js';

const router = Router();

router.get('/guilds/:guildId/quests', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const result = await questService.getQuestsByGuildId(guildId);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/guilds/:guildId/quests', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const { title, description, rewardContribution, rewardFunds, deadline, publisherId } = req.body;
    const result = await questService.publishQuest(
      guildId,
      title,
      description,
      rewardContribution,
      rewardFunds,
      deadline,
      publisherId
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

router.post('/quests/:id/accept', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    await questService.acceptQuest(id, userId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/quests/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    await questService.completeQuest(id, userId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/quests/settle', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await questService.settleExpiredQuests();
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
