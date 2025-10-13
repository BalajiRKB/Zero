import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, DollarSign, Users, Calendar, Filter } from 'lucide-react';
import { channelService } from '../services/channelService.ts';
import { expenseService } from '../services/expenseService.ts';
import { formatCurrency } from '../utils/currency.ts';
import type { ExpenseForm, ExpenseCategory } from '../types/index.ts';

const ChannelPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const queryClient = useQueryClient();

  // Fetch channel data
  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', id],
    queryFn: () => channelService.getChannel(id!),
    enabled: !!id,
  });

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expenseService.getExpenses(id!, { limit: 50 }),
    enabled: !!id,
  });

  // Fetch summary
  const { data: summaryData } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => expenseService.getExpenseSummary(id!),
    enabled: !!id,
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: (data: ExpenseForm) => expenseService.createExpense(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', id] });
      queryClient.invalidateQueries({ queryKey: ['summary', id] });
      queryClient.invalidateQueries({ queryKey: ['channel', id] });
      setShowAddExpense(false);
    },
  });

  if (channelLoading || !channelData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const channel = channelData.channel;
  const expenses = expensesData?.expenses || [];
  const summary = summaryData?.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{channel.name}</h1>
            {channel.description && (
              <p className="text-gray-600 mt-1">{channel.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(channel.totalExpenses, channel.currency)}
              </p>
              <p className="text-xs text-gray-500">{channel.currency}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {channel.members.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expenses Count</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.expenseCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
        <div className="flex flex-wrap gap-2">
          {channel.members.map((member) => (
            <div
              key={member.user.id}
              className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
            >
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium">{member.user.name}</span>
              {member.role === 'admin' && (
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        {expensesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses yet</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn-primary mt-4"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{expense.title}</h3>
                    {expense.description && (
                      <p className="text-sm text-gray-600">{expense.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Paid by {expense.paidBy.name}</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency || channel.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Split {expense.splitBetween.length} ways
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          channel={channel}
          onClose={() => setShowAddExpense(false)}
          onSubmit={(data) => addExpenseMutation.mutate(data)}
          isLoading={addExpenseMutation.isPending}
        />
      )}
    </div>
  );
};

// Add Expense Modal
const AddExpenseModal = ({ channel, onClose, onSubmit, isLoading }: {
  channel: any;
  onClose: () => void;
  onSubmit: (data: ExpenseForm) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<ExpenseForm>({
    title: '',
    description: '',
    amount: 0,
    category: 'Other' as ExpenseCategory,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories: ExpenseCategory[] = [
    'Food', 'Transport', 'Accommodation', 'Entertainment', 'Utilities', 'Shopping', 'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Groceries from Walmart"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ({channel.currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              className="input-field"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="input-field"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Additional details about this expense"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              This expense will be split equally among all {channel.members.length} members.
              <br />
              <span className="text-xs">
                Each person owes: {formatCurrency((formData.amount || 0) / channel.members.length, channel.currency)}
              </span>
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelPage;