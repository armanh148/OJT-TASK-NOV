import { Router } from 'express';
import { SummaryController } from '../controllers/summaryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', SummaryController.getAnalyticsSummary);

export default router;
