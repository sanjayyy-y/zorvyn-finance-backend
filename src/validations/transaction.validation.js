const { z } = require('zod');

// Accepts both "2026-01-15" and "2026-01-15T00:00:00.000Z"
const dateStringSchema = z.string().refine(
  val => !isNaN(Date.parse(val)),
  { message: 'Invalid date format. Use YYYY-MM-DD or ISO 8601.' }
);

const createTransaction = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Category is required'),
    date: dateStringSchema.optional(),
    notes: z.string().optional(),
  }),
});

const updateTransaction = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1, 'Category is required').optional(),
    date: dateStringSchema.optional(),
    notes: z.string().optional(),
  }),
});

const getTransactions = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    category: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
  }),
});

module.exports = {
  createTransaction,
  updateTransaction,
  getTransactions,
};
