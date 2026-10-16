import { computed, effect, Injectable, signal } from '@angular/core';
import { DEMO_BUDGETS, DEMO_GOALS, DEMO_OPENING_BALANCE, DEMO_SETTINGS, DEMO_TRANSACTIONS } from './demo-data';
import { formatMoney, inRange, monthKey, periodLabel, signedAmount } from './money';
import {
  AppSettings,
  BudgetCategory,
  ColorTheme,
  ConfirmRequest,
  DisplayCurrency,
  OPENING_BALANCE,
  PeriodKey,
  SavingsGoal,
  Transaction,
  UndoToast,
} from './models';

interface PersistedState {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  goals: SavingsGoal[];
  settings: AppSettings;
}

const DATA_KEY = 'kori.demo.v1';
const CONSENT_KEY = 'kori.local-consent';
const THEME_KEY = 'kori.theme';

@Injectable({ providedIn: 'root' })
export class FinanceStore {
  readonly transactions = signal<Transaction[]>(structuredClone(DEMO_TRANSACTIONS));
  readonly budgets = signal<BudgetCategory[]>(structuredClone(DEMO_BUDGETS));
  readonly goals = signal<SavingsGoal[]>(structuredClone(DEMO_GOALS));
  readonly settings = signal<AppSettings>({ ...DEMO_SETTINGS });
  readonly consent = signal<'unknown' | 'accepted' | 'declined'>('unknown');
  readonly confirm = signal<ConfirmRequest | null>(null);
  readonly toast = signal<UndoToast | null>(null);

  private confirmResolver: ((ok: boolean) => void) | null = null;
  private undoHandler: (() => void) | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private skippedPersist = false;

  readonly periodTransactions = computed(() => {
    const period = this.settings().period;
    return this.transactions().filter((tx) => inRange(tx.date, period));
  });

  readonly completed = computed(() => this.transactions().filter((tx) => tx.status === 'completed'));

  readonly availableBalance = computed(() =>
    this.completed().reduce((sum, tx) => sum + signedAmount(tx), DEMO_OPENING_BALANCE),
  );

  readonly periodIncome = computed(() =>
    this.periodTransactions()
      .filter((tx) => tx.type === 'income' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0),
  );

  readonly periodExpense = computed(() =>
    this.periodTransactions()
      .filter((tx) => tx.type === 'expense' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0),
  );

  readonly periodSavings = computed(() =>
    this.periodTransactions()
      .filter((tx) => tx.category === 'Épargne' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0),
  );

  readonly monthlySeries = computed(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, { income: 0, expense: 0 });
    }
    for (const tx of this.completed()) {
      const key = monthKey(tx.date);
      const bucket = map.get(key);
      if (!bucket) {
        continue;
      }
      if (tx.type === 'income') {
        bucket.income += tx.amount;
      } else {
        bucket.expense += tx.amount;
      }
    }
    return [...map.entries()].map(([month, values]) => ({ month, ...values }));
  });

  readonly expenseByCategory = computed(() => {
    const map = new Map<string, number>();
    for (const tx of this.periodTransactions()) {
      if (tx.type !== 'expense' || tx.status !== 'completed') {
        continue;
      }
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  });

  readonly budgetStats = computed(() => {
    const spentMap = new Map<string, number>();
    for (const tx of this.periodTransactions()) {
      if (tx.type !== 'expense' || tx.status !== 'completed') {
        continue;
      }
      spentMap.set(tx.category, (spentMap.get(tx.category) ?? 0) + tx.amount);
    }
    return this.budgets().map((budget) => {
      const spent = spentMap.get(budget.name) ?? 0;
      const ratio = budget.limit === 0 ? 0 : spent / budget.limit;
      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        ratio,
        state: ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warn' : 'ok',
      } as const;
    });
  });

  readonly totalBudget = computed(() => this.budgets().reduce((sum, b) => sum + b.limit, 0));
  readonly totalBudgetSpent = computed(() => this.budgetStats().reduce((sum, b) => sum + b.spent, 0));

  readonly insights = computed(() => {
    const cats = this.expenseByCategory();
    const top = cats[0];
    const over = this.budgetStats().filter((b) => b.state !== 'ok');
    const income = this.periodIncome();
    const expense = this.periodExpense();
    const savings = this.periodSavings();
    const rate = income === 0 ? 0 : Math.round((savings / income) * 100);
    const items: { title: string; detail: string; tone: 'up' | 'down' | 'flat' }[] = [];
    if (top) {
      items.push({
        title: `${top.name} en tête`,
        detail: `${this.money(top.amount)} de dépenses sur la période, soit la plus grosse catégorie.`,
        tone: 'down',
      });
    }
    if (over.length) {
      items.push({
        title: `${over.length} budget${over.length > 1 ? 's' : ''} à surveiller`,
        detail: over.map((b) => b.name).join(', '),
        tone: 'down',
      });
    } else {
      items.push({
        title: 'Budgets sous contrôle',
        detail: 'Aucune catégorie n’a dépassé 80 % de son plafond sur la période.',
        tone: 'up',
      });
    }
    items.push({
      title: `Taux d’épargne ${rate} %`,
      detail: `Observé à partir des versements « Épargne » (${this.money(savings)}) rapportés aux revenus (${this.money(income)}).`,
      tone: rate >= 20 ? 'up' : 'flat',
    });
    const net = income - expense;
    items.push({
      title: net >= 0 ? 'Solde de période positif' : 'Solde de période négatif',
      detail: `Revenus ${this.money(income)} · Dépenses ${this.money(expense)}. Les opérations en attente ne sont pas comptées.`,
      tone: net >= 0 ? 'up' : 'down',
    });
    return items;
  });

  constructor() {
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    if (storedConsent === 'accepted' || storedConsent === 'declined') {
      this.consent.set(storedConsent);
    }
    if (this.consent() === 'accepted') {
      this.restore();
    }
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      this.settings.update((s) => ({ ...s, theme: storedTheme }));
    }
    this.applyTheme(this.settings().theme);
    effect(() => {
      const snapshot: PersistedState = {
        transactions: this.transactions(),
        budgets: this.budgets(),
        goals: this.goals(),
        settings: this.settings(),
      };
      this.applyTheme(snapshot.settings.theme);
      if (this.skippedPersist) {
        return;
      }
      if (this.consent() === 'accepted') {
        localStorage.setItem(DATA_KEY, JSON.stringify(snapshot));
      }
    });
  }

  money(amount: number): string {
    return formatMoney(amount, this.settings().currency, this.settings().compactNumbers);
  }

  periodTitle(): string {
    return periodLabel(this.settings().period);
  }

  setPeriod(period: PeriodKey): void {
    this.settings.update((s) => ({ ...s, period }));
  }

  setCurrency(currency: DisplayCurrency): void {
    this.settings.update((s) => ({ ...s, currency }));
  }

  setCompactNumbers(compactNumbers: boolean): void {
    this.settings.update((s) => ({ ...s, compactNumbers }));
  }

  setTheme(theme: ColorTheme): void {
    this.settings.update((s) => ({ ...s, theme }));
  }

  toggleTheme(): void {
    this.setTheme(this.settings().theme === 'dark' ? 'light' : 'dark');
  }

  acceptLocalStorage(): void {
    this.consent.set('accepted');
    localStorage.setItem(CONSENT_KEY, 'accepted');
    this.notify('Préférences et données de démo enregistrées dans ce navigateur.');
  }

  declineLocalStorage(): void {
    this.consent.set('declined');
    localStorage.setItem(CONSENT_KEY, 'declined');
    localStorage.removeItem(DATA_KEY);
    this.notify('Les données restent en mémoire pour cette session uniquement.');
  }

  resetDemo(): void {
    const theme = this.settings().theme;
    this.transactions.set(structuredClone(DEMO_TRANSACTIONS));
    this.budgets.set(structuredClone(DEMO_BUDGETS));
    this.goals.set(structuredClone(DEMO_GOALS));
    this.settings.set({ ...DEMO_SETTINGS, theme });
    this.notify('Jeu de démo réinitialisé.');
  }

  upsertTransaction(input: Omit<Transaction, 'id'> & { id?: string }, silent = false): void {
    if (input.id) {
      this.transactions.update((list) => list.map((tx) => (tx.id === input.id ? { ...tx, ...input, id: input.id } : tx)));
      if (!silent) {
        this.notify('Transaction mise à jour.');
      }
      return;
    }
    const id = this.nextId();
    this.transactions.update((list) => [{ ...input, id }, ...list]);
    if (!silent) {
      this.notify('Transaction ajoutée.');
    }
  }

  async removeTransaction(id: string): Promise<void> {
    const current = this.transactions().find((tx) => tx.id === id);
    if (!current) {
      return;
    }
    const ok = await this.ask({
      title: 'Supprimer la transaction',
      message: `« ${current.description} » (${this.money(current.amount)}) sera retirée de l’historique.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    this.transactions.update((list) => list.filter((tx) => tx.id !== id));
    this.notify('Transaction supprimée.', () => {
      this.transactions.update((list) => [current, ...list]);
    });
  }

  async removeMany(ids: string[]): Promise<void> {
    if (!ids.length) {
      return;
    }
    const snapshot = this.transactions().filter((tx) => ids.includes(tx.id));
    const ok = await this.ask({
      title: `Supprimer ${ids.length} transaction${ids.length > 1 ? 's' : ''}`,
      message: 'Cette action retire les lignes sélectionnées de l’historique local.',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      tone: 'danger',
    });
    if (!ok) {
      return;
    }
    this.transactions.update((list) => list.filter((tx) => !ids.includes(tx.id)));
    this.notify('Sélection supprimée.', () => {
      this.transactions.update((list) => [...snapshot, ...list]);
    });
  }

  updateBudget(id: string, limit: number): void {
    this.budgets.update((list) => list.map((b) => (b.id === id ? { ...b, limit } : b)));
    this.notify('Budget mis à jour.');
  }

  contributeToGoal(goalId: string, amount: number): void {
    const goal = this.goals().find((g) => g.id === goalId);
    if (!goal || amount <= 0) {
      return;
    }
    this.goals.update((list) =>
      list.map((g) => (g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g)),
    );
    this.upsertTransaction({
      description: `Versement — ${goal.name}`,
      category: 'Épargne',
      type: 'expense',
      amount,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Wave',
      status: 'completed',
    }, true);
    this.notify('Contribution enregistrée.');
  }

  resolveConfirm(ok: boolean): void {
    this.confirm.set(null);
    this.confirmResolver?.(ok);
    this.confirmResolver = null;
  }

  consumeUndo(): void {
    this.undoHandler?.();
    this.undoHandler = null;
    this.toast.set(null);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.notify('Action annulée.');
  }

  flash(message: string): void {
    this.notify(message);
  }

  dismissToast(): void {
    this.toast.set(null);
    this.undoHandler = null;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  exportCsv(rows: Transaction[]): void {
    const header = ['id', 'description', 'category', 'type', 'amount', 'date', 'paymentMethod', 'status'];
    const body = rows.map((tx) => header.map((key) => `"${String(tx[key as keyof Transaction])}"`).join(';'));
    const blob = new Blob([[header.join(';'), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kori-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.notify('Export CSV généré.');
  }

  private ask(request: ConfirmRequest): Promise<boolean> {
    this.confirm.set(request);
    return new Promise((resolve) => {
      this.confirmResolver = resolve;
    });
  }

  private notify(message: string, undo?: () => void): void {
    this.undoHandler = undo ?? null;
    this.toast.set({ message, undoLabel: undo ? 'Annuler' : undefined });
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => this.dismissToast(), 5000);
  }

  private nextId(): string {
    const nums = this.transactions()
      .map((tx) => Number(tx.id.replace(/\D/g, '')))
      .filter((n) => !Number.isNaN(n));
    return `TX-${Math.max(1000, ...nums) + 1}`;
  }

  private applyTheme(theme: ColorTheme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  private restore(): void {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as PersistedState;
      this.skippedPersist = true;
      this.transactions.set(parsed.transactions ?? structuredClone(DEMO_TRANSACTIONS));
      this.budgets.set(parsed.budgets ?? structuredClone(DEMO_BUDGETS));
      this.goals.set(parsed.goals ?? structuredClone(DEMO_GOALS));
      this.settings.set({ ...DEMO_SETTINGS, ...parsed.settings });
    } catch {
      localStorage.removeItem(DATA_KEY);
    } finally {
      queueMicrotask(() => {
        this.skippedPersist = false;
      });
    }
  }
}

export { OPENING_BALANCE };
