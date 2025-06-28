import { Router } from 'express';
import { createTransaction, getTransactions,getTransaction, getLastTransaction } from '../controllers/transactionController';
import { catchAsync } from '../utils/catchAsync';
import { apiKeyAuth } from '../middleware/auth';

const router = Router();

// Aplicar autenticação com API key em todas as rotas de transação
router.use(apiKeyAuth);

router.post('/save', catchAsync(createTransaction));
router.get('/get', catchAsync(getTransactions));
router.get('/get/:transactionId', catchAsync(getTransaction));
router.get('/getLastTransaction', catchAsync(getLastTransaction));

export default router;
