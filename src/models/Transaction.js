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
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// automatically filter out soft-deleted records on any find query
transactionSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// indexes for common query patterns
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
