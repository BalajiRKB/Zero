const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'KRW', 'SEK', 'NOK', 'DKK', 'SGD', 'HKD']
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Accommodation', 'Entertainment', 'Utilities', 'Shopping', 'Other'],
    default: 'Other'
  },
  splitBetween: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  receipt: {
    type: String, // URL to receipt image
    default: ''
  }
}, {
  timestamps: true
});

// Calculate total split amount
expenseSchema.virtual('totalSplit').get(function() {
  return this.splitBetween.reduce((total, split) => total + split.amount, 0);
});

module.exports = mongoose.model('Expense', expenseSchema);