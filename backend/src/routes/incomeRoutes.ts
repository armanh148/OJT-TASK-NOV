import { Router } from 'express';
import { IncomeController, setIncomeSchema, getIncomeQuerySchema } from '../controllers/incomeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

// Require JWT authentication for all income endpoints
router.use(authMiddleware);

router.post(
  '/',
  validate({ body: setIncomeSchema }),
  IncomeController.setIncome
);

router.get(
  '/',
  validate({ query: getIncomeQuerySchema }),
  IncomeController.getIncome
);

export default router;
