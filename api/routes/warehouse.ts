import { Router, type Request, type Response } from 'express';
import * as warehouseService from '../services/warehouseService.js';
import { ValidationError } from '../validators/index.js';

const router = Router();

router.get('/guilds/:guildId/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const result = await warehouseService.getItemsByGuildId(guildId);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/guilds/:guildId/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const { name, quantity, rarity, contributorId } = req.body;
    const result = await warehouseService.contributeItem(
      guildId,
      name,
      quantity,
      rarity,
      contributorId
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

router.get('/guilds/:guildId/item-applications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const result = await warehouseService.getItemApplicationsByGuildId(guildId);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/guilds/:guildId/item-applications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params;
    const { itemId, quantity, userId } = req.body;
    const result = await warehouseService.applyForItem(
      guildId,
      itemId,
      quantity,
      userId
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

router.post('/item-applications/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewerId } = req.body;
    await warehouseService.approveItemApplication(id, reviewerId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/item-applications/:id/reject', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewerId } = req.body;
    await warehouseService.rejectItemApplication(id, reviewerId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

export default router;
