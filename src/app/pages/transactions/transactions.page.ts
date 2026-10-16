import { Component, computed, inject, signal } from '@angular/core';
import { FinanceStore } from '../../core/finance.store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PeriodKey, Transaction } from '../../core/models';
import { inRange, periodLabel } from '../../core/money';
import { DataTableColumn, DataTablePage, DataTableRow, FilterConfig } from '../../library-ui/data-table/data-table';
import { TransactionDraft, TransactionFormComponent } from '../../shared/transaction-form.component';
import { AccountMenuComponent, AccountMenuItem } from '../../library-ui/account-menu/account-menu.component';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [DataTablePage, TransactionFormComponent, AccountMenuComponent],
  templateUrl: './transactions.page.html',
})
export class TransactionsPage {
  protected readonly store = inject(FinanceStore);
  protected readonly formOpen = signal(false);
  protected readonly viewing = signal<Transaction | null>(null);
  protected readonly draft = signal<TransactionDraft>(this.emptyDraft());
  protected readonly rowMenu = signal<AccountMenuItem[]>([
    { id: 'edit', label: 'Modifier', icon: 'settings' },
    { id: 'delete', label: 'Supprimer', icon: 'sign-out', dividerBefore: true },
  ]);
  protected readonly periodFilter = signal<PeriodKey | 'all'>('all');
  protected readonly periodItems: AccountMenuItem[] = [
    { id: 'all', label: 'Toutes les dates', icon: 'community' },
    { id: 'this-month', label: 'Ce mois', icon: 'profile' },
    { id: 'last-month', label: 'Mois dernier', icon: 'subscription' },
    { id: 'last-3-months', label: '3 derniers mois', icon: 'settings' },
    { id: 'year', label: 'Cette année', icon: 'help' },
  ];
  protected readonly periodButton = computed(() =>
    this.periodFilter() === 'all' ? 'Période' : periodLabel(this.periodFilter() as PeriodKey),
  );

  protected readonly columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '96px' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'category', label: 'Catégorie', sortable: true, type: 'badge', badgeColors: this.badgeMap() },
    { key: 'type', label: 'Type', sortable: true, type: 'badge', badgeColors: { Revenu: 'success', Dépense: 'danger' } },
    { key: 'amount', label: 'Montant', sortable: true, type: 'currency', align: 'right' },
    { key: 'date', label: 'Date', sortable: true, type: 'date' },
    { key: 'paymentMethod', label: 'Paiement', sortable: true },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      type: 'badge',
      badgeColors: { Confirmée: 'success', 'En attente': 'warning', Échouée: 'danger' },
    },
    { key: 'actions', label: '', type: 'actions', width: '100px', align: 'center' },
  ];

  protected readonly filters = signal<FilterConfig[]>([
    {
      key: 'category',
      label: 'Catégorie',
      value: '',
      options: [
        { value: '', label: 'Toutes les catégories' },
        ...[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => ({ value: c, label: c })),
      ],
    },
    {
      key: 'type',
      label: 'Type',
      value: '',
      options: [
        { value: '', label: 'Tous les types' },
        { value: 'Revenu', label: 'Revenu' },
        { value: 'Dépense', label: 'Dépense' },
      ],
    },
  ]);

  protected readonly rows = computed<DataTableRow[]>(() => {
    const period = this.periodFilter();
    return this.store.transactions()
      .filter((tx) => (period === 'all' ? true : inRange(tx.date, period)))
      .map((tx) => ({
        id: tx.id,
        description: tx.description,
        category: tx.category,
        type: tx.type === 'income' ? 'Revenu' : 'Dépense',
        amount: tx.amount,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        status: tx.status === 'completed' ? 'Confirmée' : tx.status === 'pending' ? 'En attente' : 'Échouée',
        selected: false,
      }));
  });

  protected readonly moneyFn = computed(() => (value: number) => this.store.money(value));

  onPeriod(item: AccountMenuItem): void {
    this.periodFilter.set(item.id === 'all' ? 'all' : (item.id as PeriodKey));
  }

  openAdd(): void {
    this.draft.set(this.emptyDraft());
    this.formOpen.set(true);
  }

  openEdit(row: DataTableRow): void {
    const tx = this.store.transactions().find((item) => item.id === row['id']);
    if (!tx) {
      return;
    }
    this.draft.set({ ...tx });
    this.formOpen.set(true);
  }

  openView(row: DataTableRow): void {
    this.viewing.set(this.store.transactions().find((item) => item.id === String(row['id'])) ?? null);
  }

  async remove(row: DataTableRow): Promise<void> {
    await this.store.removeTransaction(String(row['id']));
  }

  async bulk(rows: DataTableRow[]): Promise<void> {
    await this.store.removeMany(rows.map((r) => String(r['id'])));
  }

  export(rows: DataTableRow[]): void {
    const ids = new Set(rows.map((r) => r['id']));
    this.store.exportCsv(this.store.transactions().filter((tx) => ids.has(tx.id)));
  }

  save(draft: TransactionDraft): void {
    this.store.upsertTransaction({
      id: draft.id,
      description: draft.description.trim(),
      category: draft.category,
      type: draft.type,
      amount: Number(draft.amount),
      date: draft.date,
      paymentMethod: draft.paymentMethod,
      status: draft.status,
    });
    this.formOpen.set(false);
  }

  onRowAction(item: AccountMenuItem): void {
    const current = this.viewing();
    if (!current) {
      return;
    }
    if (item.id === 'edit') {
      this.draft.set({ ...current });
      this.viewing.set(null);
      this.formOpen.set(true);
    }
    if (item.id === 'delete') {
      this.viewing.set(null);
      void this.store.removeTransaction(current.id);
    }
  }

  private emptyDraft(): TransactionDraft {
    return {
      description: '',
      category: EXPENSE_CATEGORIES[0],
      type: 'expense',
      amount: null,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Wave',
      status: 'completed',
    };
  }

  private badgeMap(): Record<string, string> {
    return {
      Freelance: 'success',
      'Transfert familial': 'primary',
      Alimentation: 'warning',
      Transport: 'secondary',
      Logement: 'primary',
      Télécoms: 'secondary',
      Santé: 'danger',
      Loisirs: 'warning',
      Formation: 'primary',
      Épargne: 'success',
      Divers: 'secondary',
    };
  }
}
