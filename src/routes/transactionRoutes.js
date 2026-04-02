const express = require('express');
const transactionController = require('../controllers/TransactionController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const transactionValidation = require('../validations/transaction.validation');

const router = express.Router();

router.use(authMiddleware.protect);

// Analyst and Admin can read transactions
router.get('/', authMiddleware.restrictTo('ANALYST', 'ADMIN'), validate(transactionValidation.getTransactions), transactionController.getTransactions);
router.get('/:id', authMiddleware.restrictTo('ANALYST', 'ADMIN'), transactionController.getTransactionById);

// Only Admin can modify
router.use(authMiddleware.restrictTo('ADMIN'));
router.post('/', validate(transactionValidation.createTransaction), transactionController.createTransaction);
router.put('/:id', validate(transactionValidation.updateTransaction), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
