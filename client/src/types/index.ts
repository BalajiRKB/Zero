// Currency types
export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
];

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  channels: string[];
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

// Channel types
export interface Channel {
  _id: string;
  name: string;
  description?: string;
  creator: User;
  members: ChannelMember[];
  inviteCode: string;
  totalExpenses: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  user: User;
  joinedAt: string;
  role: 'admin' | 'member';
}

// Expense types
export interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: User;
  channel: string | Channel;
  category: ExpenseCategory;
  splitBetween: ExpenseSplit[];
  date: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSplit {
  user: User;
  amount: number;
}

export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Accommodation' 
  | 'Entertainment' 
  | 'Utilities' 
  | 'Shopping' 
  | 'Other';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ExpensesResponse {
  success: boolean;
  expenses: Expense[];
  currentPage: number;
  totalPages: number;
  totalExpenses: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  expenseCount: number;
  currency: string;
  memberBalances: Record<string, {
    name: string;
    paid: number;
    owes: number;
    balance: number;
  }>;
  categoryBreakdown: Record<string, number>;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChannelForm {
  name: string;
  description?: string;
  currency: string;
}

export interface ExpenseForm {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  splitBetween?: ExpenseSplit[];
  date?: string;
}