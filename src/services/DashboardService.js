const Transaction = require('../models/Transaction');

class DashboardService {
  static async getSummary() {
    // We only want to aggregate non-deleted transactions.
    const matchStage = { $match: { isDeleted: { $ne: true } } };

    // Grouping everything to get grand totals
    const grandTotalsPromise = Transaction.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          netBalance: { $subtract: ['$totalIncome', '$totalExpense'] }
        }
      }
    ]);

    // Category breakdown
    const categoryBreakdownPromise = Transaction.aggregate([
      matchStage,
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: 1,
        }
      },
      { $sort: { total: -1 } }
    ]);

    const [grandTotalsResult, categoryBreakdown] = await Promise.all([
      grandTotalsPromise,
      categoryBreakdownPromise
    ]);

    const grandTotals = grandTotalsResult[0] || { totalIncome: 0, totalExpense: 0, netBalance: 0 };

    return {
      ...grandTotals,
      categoryBreakdown,
    };
  }

  static async getTrends() {
    const matchStage = { $match: { isDeleted: { $ne: true } } };

    // Grouping by year and month
    const trends = await Transaction.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    return trends;
  }
}

module.exports = DashboardService;
