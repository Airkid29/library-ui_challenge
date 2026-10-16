import { DisplayCurrency, PeriodKey, Transaction } from './models';

const RATES: Record<DisplayCurrency, number> = {
  XOF: 1,
  EUR: 1 / 655.957,
  USD: 1 / 600,
};

export function inRange(dateIso: string, period: PeriodKey, now = new Date()): boolean {
  const date = new Date(`${dateIso}T12:00:00`);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'this-month') {
    start.setDate(1);
    return date >= start && date <= end;
  }
  if (period === 'last-month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return date >= from && date <= to;
  }
  if (period === 'last-3-months') {
    start.setMonth(start.getMonth() - 2, 1);
    return date >= start && date <= end;
  }
  start.setMonth(0, 1);
  return date >= start && date <= end;
}

export function monthKey(dateIso: string): string {
  return dateIso.slice(0, 7);
}

export function formatMoney(amountXof: number, currency: DisplayCurrency, compact = false): string {
  const value = amountXof * RATES[currency];
  if (compact && Math.abs(value) >= 1000 && currency === 'XOF') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value / 1000)} k F CFA`;
  }
  if (currency === 'XOF') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} F CFA`;
  }
  return new Intl.NumberFormat(currency === 'EUR' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function signedAmount(tx: Transaction): number {
  if (tx.status !== 'completed') {
    return 0;
  }
  return tx.type === 'income' ? tx.amount : -tx.amount;
}

export function periodLabel(period: PeriodKey): string {
  switch (period) {
    case 'this-month':
      return 'Ce mois';
    case 'last-month':
      return 'Mois dernier';
    case 'last-3-months':
      return '3 derniers mois';
    default:
      return 'Cette année';
  }
}
