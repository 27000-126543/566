import { Router, type Request, type Response } from 'express';
import * as authService from '../services/authService.js';
import { ValidationError } from '../validators/index.js';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, profession } = req.body;
    const result = await authService.register(username, password, profession);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
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
