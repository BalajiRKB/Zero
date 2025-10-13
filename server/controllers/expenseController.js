const Joi = require('joi');
const Expense = require('../models/Expense');
const Channel = require('../models/Channel');

// Validation schemas
const expenseSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  amount: Joi.number().min(0.01).required(),
  category: Joi.string().valid('Food', 'Transport', 'Accommodation', 'Entertainment', 'Utilities', 'Shopping', 'Other').optional(),
  splitBetween: Joi.array().items(Joi.object({
    user: Joi.string().required(),
    amount: Joi.number().min(0).required()
  })).optional(),
  date: Joi.date().optional()
});

// @desc    Get expenses for a channel
// @route   GET /api/channels/:channelId/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    // Check if user is member of the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isMember = channel.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query
    const query = { channel: channelId };
    
    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      expenses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalExpenses: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new expense
// @route   POST /api/channels/:channelId/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { error, value } = expenseSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user is member of the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isMember = channel.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, amount, category, splitBetween, date } = value;

    // Use channel's currency for the expense
    const expenseCurrency = channel.currency;

    // If no split specified, split equally among all members
    let finalSplitBetween = splitBetween;
    if (!finalSplitBetween || finalSplitBetween.length === 0) {
      const memberCount = channel.members.length;
      const splitAmount = amount / memberCount;
      
      finalSplitBetween = channel.members.map(member => ({
        user: member.user,
        amount: splitAmount
      }));
    }

    // Validate split amounts
    const totalSplit = finalSplitBetween.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplit - amount) > 0.01) {
      return res.status(400).json({ 
        message: 'Split amounts must equal the total expense amount' 
      });
    }

    const expense = await Expense.create({
      title,
      description,
      amount,
      currency: expenseCurrency,
      category: category || 'Other',
      paidBy: req.user.id,
      channel: channelId,
      splitBetween: finalSplitBetween,
      date: date || new Date()
    });

    // Update channel total expenses
    channel.totalExpenses += amount;
    await channel.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email');

    res.status(201).json({
      success: true,
      expense: populatedExpense
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email')
      .populate('channel', 'name');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is member of the channel
    const channel = await Channel.findById(expense.channel._id);
    const isMember = channel.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or channel admin
    const channel = await Channel.findById(expense.channel);
    const member = channel.members.find(m => m.user.toString() === req.user.id);
    
    if (expense.paidBy.toString() !== req.user.id && (!member || member.role !== 'admin')) {
      return res.status(403).json({ message: 'Only the payer or channel admin can update this expense' });
    }

    const { title, description, amount, category, splitBetween, date } = value;
    const oldAmount = expense.amount;

    // Update expense fields
    expense.title = title;
    expense.description = description;
    expense.amount = amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    if (splitBetween) {
      const totalSplit = splitBetween.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        return res.status(400).json({ 
          message: 'Split amounts must equal the total expense amount' 
        });
      }
      expense.splitBetween = splitBetween;
    }

    await expense.save();

    // Update channel total expenses
    channel.totalExpenses = channel.totalExpenses - oldAmount + amount;
    await channel.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email');

    res.json({
      success: true,
      expense: populatedExpense
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or channel admin
    const channel = await Channel.findById(expense.channel);
    const member = channel.members.find(m => m.user.toString() === req.user.id);
    
    if (expense.paidBy.toString() !== req.user.id && (!member || member.role !== 'admin')) {
      return res.status(403).json({ message: 'Only the payer or channel admin can delete this expense' });
    }

    // Update channel total expenses
    channel.totalExpenses -= expense.amount;
    await channel.save();

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get expense summary for channel
// @route   GET /api/channels/:channelId/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
  try {
    const { channelId } = req.params;

    // Check if user is member of the channel
    const channel = await Channel.findById(channelId).populate('members.user', 'name email');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const isMember = channel.members.some(member => 
      member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all expenses for the channel
    const expenses = await Expense.find({ channel: channelId })
      .populate('paidBy', 'name')
      .populate('splitBetween.user', 'name');

    // Calculate summary
    const summary = {
      totalExpenses: channel.totalExpenses,
      expenseCount: expenses.length,
      currency: channel.currency, // Include channel currency
      memberBalances: {},
      categoryBreakdown: {}
    };

    // Initialize member balances
    channel.members.forEach(member => {
      summary.memberBalances[member.user._id] = {
        name: member.user.name,
        paid: 0,
        owes: 0,
        balance: 0
      };
    });

    // Calculate balances and category breakdown
    expenses.forEach(expense => {
      // Track how much each member paid
      const paidById = expense.paidBy._id.toString();
      if (summary.memberBalances[paidById]) {
        summary.memberBalances[paidById].paid += expense.amount;
      }

      // Track how much each member owes
      expense.splitBetween.forEach(split => {
        const userId = split.user._id.toString();
        if (summary.memberBalances[userId]) {
          summary.memberBalances[userId].owes += split.amount;
        }
      });

      // Category breakdown
      if (summary.categoryBreakdown[expense.category]) {
        summary.categoryBreakdown[expense.category] += expense.amount;
      } else {
        summary.categoryBreakdown[expense.category] = expense.amount;
      }
    });

    // Calculate final balances (positive = others owe them, negative = they owe others)
    Object.keys(summary.memberBalances).forEach(userId => {
      const member = summary.memberBalances[userId];
      member.balance = member.paid - member.owes;
    });

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
};