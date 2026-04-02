const TransactionService = require('../services/TransactionService');
const catchAsync = require('../utils/catchAsync');

exports.createTransaction = catchAsync(async (req, res, next) => {
  const transaction = await TransactionService.createTransaction(req.body, req.user._id);
  res.status(201).json({
    status: 'success',
    data: { transaction },
  });
});

exports.getTransactions = catchAsync(async (req, res, next) => {
  const { transactions, meta } = await TransactionService.getTransactions(req.query);
  res.status(200).json({
    status: 'success',
    meta,
    data: { transactions },
  });
});

exports.getTransactionById = catchAsync(async (req, res, next) => {
  const transaction = await TransactionService.getTransactionById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { transaction },
  });
});

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const transaction = await TransactionService.updateTransaction(req.params.id, req.body, req.user._id);
  res.status(200).json({
    status: 'success',
    data: { transaction },
  });
});

exports.deleteTransaction = catchAsync(async (req, res, next) => {
  await TransactionService.deleteTransaction(req.params.id, req.user._id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
