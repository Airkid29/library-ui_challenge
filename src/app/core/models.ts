export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type PaymentMethod = 'Mixx by Yas'|'Wave' | 'Orange Money' | 'MTN MoMo' | 'Virement' | 'Carte' | 'Espèces';
export type DisplayCurrency = 'XOF' | 'EUR' | 'USD';
export type PeriodKey = 'this-month' | 'last-month' | 'last-3-months' | 'year';
export type ColorTheme = 'dark' | 'light';

export interface Transaction {
  id: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
}

export interface AppSettings {
  displayName: string;
  city: string;
  currency: DisplayCurrency;
  compactNumbers: boolean;
  period: PeriodKey;
  theme: ColorTheme;
}

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'neutral';
}

export interface UndoToast {
  message: string;
  undoLabel?: string;
}

export const EXPENSE_CATEGORIES = [
  'Alimentation',
  'Transport',
  'Logement',
  'Télécoms',
  'Santé',
  'Loisirs',
  'Formation',
  'Épargne',
  'Divers',
] as const;

export const INCOME_CATEGORIES = ['Freelance', 'Transfert familial', 'Autre revenu'] as const;

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Mixx by Yas',
  'Wave',
  'Orange Money',
  'MTN MoMo',
  'Virement',
  'Carte',
  'Espèces',
];

export const OPENING_BALANCE = 420_000;
