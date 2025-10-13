import api from './api.ts';
import type { Expense, ExpenseForm, ExpensesResponse, ExpenseSummary } from '../types/index.ts';

export const expenseService = {
  // Get expenses for a channel
  getExpenses: async (
    channelId: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ExpensesResponse> => {
    const response = await api.get(`/channels/${channelId}/expenses`, { params });
    return response.data;
  },

  // Create new expense
  createExpense: async (channelId: string, data: ExpenseForm): Promise<{ success: boolean; expense: Expense }> => {
    const response = await api.post(`/channels/${channelId}/expenses`, data);
    return response.data;
  },

  // Get single expense
  getExpense: async (id: string): Promise<{ success: boolean; expense: Expense }> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Update expense
  updateExpense: async (id: string, data: ExpenseForm): Promise<{ success: boolean; expense: Expense }> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get expense summary for channel
  getExpenseSummary: async (channelId: string): Promise<{ success: boolean; summary: ExpenseSummary }> => {
    const response = await api.get(`/channels/${channelId}/summary`);
    return response.data;
  }
};