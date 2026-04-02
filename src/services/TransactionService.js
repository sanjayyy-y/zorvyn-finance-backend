const Transaction = require('../models/Transaction');
const AuditService = require('./AuditService');
const AppError = require('../utils/AppError');

class TransactionService {
  static async createTransaction(data, userId) {
    const transaction = await Transaction.create({
      ...data,
      createdBy: userId,
    });

    await AuditService.log('CREATE', 'Transaction', transaction._id, userId, { transaction });
    return transaction;
  }

  static async getTransactions(query) {
    const { page = 1, limit = 10, category, type, startDate, endDate } = query;
    
    // build filter from query params
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('createdBy', 'name email')
        .sort('-date')
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTransactionById(id) {
    const transaction = await Transaction.findById(id).populate('createdBy', 'name email');
    if (!transaction) throw new AppError('Transaction not found', 404);
    return transaction;
  }

  static async updateTransaction(id, data, adminId) {
    const transaction = await Transaction.findById(id);
    if (!transaction) throw new AppError('Transaction not found', 404);

    const oldData = transaction.toObject();
    
    Object.assign(transaction, data);
    await transaction.save();

    await AuditService.log('UPDATE', 'Transaction', transaction._id, adminId, { oldData, newData: transaction });
    return transaction;
  }

  static async deleteTransaction(id, adminId) {
    const transaction = await Transaction.findById(id);
    if (!transaction) throw new AppError('Transaction not found', 404);

    // soft delete — just flag it, don't actually remove
    transaction.isDeleted = true;
    await transaction.save();

    await AuditService.log('DELETE', 'Transaction', transaction._id, adminId, { softDeleted: true });
    return transaction;
  }
}

module.exports = TransactionService;
