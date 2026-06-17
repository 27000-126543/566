import { Router, type Request, type Response } from 'express';
import * as guildService from '../services/guildService.js';
import { ValidationError } from '../validators/index.js';
import { getDb } from '../db/index.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await guildService.getAllGuilds();
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await guildService.getGuildById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, announcement, userId } = req.body;
    const result = await guildService.createGuild(userId, name, announcement);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/:id/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const result = await guildService.applyToGuild(userId, id);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.get('/:id/applications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const applications = await guildService.getGuildApplications(id);
    const db = await getDb();
    const result = applications.map((app) => {
      const user = db.data!.users.find((u) => u.id === app.userId);
      return {
        ...app,
        user: user
          ? {
              username: user.username,
              profession: user.profession,
              level: user.level,
            }
          : null,
      };
    });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/:id/applications/:appId/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, appId } = req.params;
    const { reviewerId } = req.body;
    await guildService.approveApplication(id, appId, reviewerId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/:id/applications/:appId/reject', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, appId } = req.params;
    const { reviewerId } = req.body;
    await guildService.rejectApplication(id, appId, reviewerId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.get('/:id/members', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await guildService.getGuildMembers(id);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/:id/members/:userId/kick', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const { operatorId } = req.body;
    await guildService.kickMember(id, userId, operatorId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/:id/members/:userId/appoint-vice', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const { operatorId } = req.body;
    await guildService.appointViceLeader(id, userId, operatorId);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/:id/members/:userId/remove-vice', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const { operatorId } = req.body;
    await guildService.removeViceLeader(id, userId, operatorId);
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
