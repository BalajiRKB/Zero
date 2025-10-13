const express = require('express');
const {
  getExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// Channel-specific expense routes
router.get('/channels/:channelId/expenses', getExpenses);
router.post('/channels/:channelId/expenses', createExpense);
router.get('/channels/:channelId/summary', getExpenseSummary);

// Individual expense routes
router.get('/expenses/:id', getExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;