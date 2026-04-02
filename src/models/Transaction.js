const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'A transaction must have an amount'],
    },
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE'],
      required: [true, 'Please specify if INCOME or EXPENSE'],
    },
    category: {
      type: String,
      required: [true, 'A transaction must have a category'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A transaction must belong to a user'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Hide by default
    },
  },
  {
    timestamps: true,
  }
);

// Query Middleware: Hide soft-deleted records from standard queries
transactionSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Add indexing for faster querying on dashboard aggregations
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
