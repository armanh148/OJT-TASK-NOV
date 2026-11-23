import { Router } from 'express';
import {
  ExpenseController,
  createExpenseSchema,
  getExpensesQuerySchema,
  updateExpenseSchema,
  expenseIdParamSchema,
} from '../controllers/expenseController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

// All expense routes require JWT authentication
router.use(authMiddleware);

router.post(
  '/',
  validate({ body: createExpenseSchema }),
  ExpenseController.createExpense
);

router.get(
  '/',
  validate({ query: getExpensesQuerySchema }),
  ExpenseController.getExpenses
);

router.get('/export', ExpenseController.exportExpenses);

router.put(
  '/:id',
  validate({ params: expenseIdParamSchema, body: updateExpenseSchema }),
  ExpenseController.updateExpense
);

router.delete(
  '/:id',
  validate({ params: expenseIdParamSchema }),
  ExpenseController.deleteExpense
);

export default router;
