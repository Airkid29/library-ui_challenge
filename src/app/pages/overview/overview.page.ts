import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccountMenuComponent, AccountMenuItem } from '../../library-ui/account-menu/account-menu.component';
import { EventCardComponent, EventCardItem } from '../../library-ui/event-card/event-card.component';
import { FinanceStore } from '../../core/finance.store';
import { PeriodKey } from '../../core/models';
import { FlowChartComponent } from '../../shared/flow-chart.component';
import { TransactionDraft, TransactionFormComponent } from '../../shared/transaction-form.component';
import { signal } from '@angular/core';
import { EXPENSE_CATEGORIES } from '../../core/models';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [EventCardComponent, AccountMenuComponent, FlowChartComponent, TransactionFormComponent, RouterLink],
  templateUrl: './overview.page.html',
})
export class OverviewPage {
  private readonly router = inject(Router);
  protected readonly store = inject(FinanceStore);
  protected readonly Math = Math;
  protected readonly openingBalance = 420_000;
  protected readonly formOpen = signal(false);
  protected readonly draft = signal<TransactionDraft>(this.emptyDraft());

  protected readonly periodItems: AccountMenuItem[] = [
    { id: 'this-month', label: 'Ce mois', icon: 'community' },
    { id: 'last-month', label: 'Mois dernier', icon: 'profile' },
    { id: 'last-3-months', label: '3 derniers mois', icon: 'subscription' },
    { id: 'year', label: 'Cette année', icon: 'settings' },
  ];

  protected readonly kpiCards = computed<EventCardItem[]>(() => {
    const income = this.store.periodIncome();
    const expense = this.store.periodExpense();
    const savings = this.store.periodSavings();
    const period = this.store.periodTitle();
    const city = this.store.settings().city;
    return [
      {
        id: 'income',
        date: period,
        time: 'Revenus confirmés',
        title: 'Revenus du mois',
        location: `${city} · Freelance + transferts`,
        isDraft: false,
        avatars: [
          { initials: 'WV', name: 'Wave', colorClass: 'bg-[#C7F36B]' },
          { initials: 'VR', name: 'Virement', colorClass: 'bg-sky-300' },
        ],
        extraAttendeesCount: 1,
        attendeesStatusLabel: 'source',
        amount: this.store.money(income),
        amountVariant: 'positive',
        trendPeriodLabel: period,
        trendPercent: this.ratioLabel(income, expense + income),
        trendDirection: 'up',
        showPublishAction: false,
        editLabel: 'Voir',
        copyLabel: 'Copier',
      },
      {
        id: 'expense',
        date: period,
        time: 'Dépenses confirmées',
        title: 'Dépenses du mois',
        location: `${city} · Hors opérations en attente`,
        isDraft: false,
        avatars: [
          { initials: 'AL', name: 'Alimentation', colorClass: 'bg-amber-300' },
          { initials: 'LG', name: 'Logement', colorClass: 'bg-orange-300' },
          { initials: 'TR', name: 'Transport', colorClass: 'bg-red-300' },
        ],
        extraAttendeesCount: 4,
        attendeesStatusLabel: 'catégories',
        amount: this.store.money(expense),
        amountVariant: 'negative',
        trendPeriodLabel: period,
        trendPercent: this.ratioLabel(expense, expense + income),
        trendDirection: 'down',
        showPublishAction: false,
        editLabel: 'Voir',
        copyLabel: 'Copier',
      },
      {
        id: 'savings',
        date: period,
        time: 'Versements Épargne',
        title: 'Épargne du mois',
        location: `${city} · Objectifs liés`,
        isDraft: false,
        avatars: [
          { initials: 'PC', name: 'Ordinateur', colorClass: 'bg-[#C7F36B]' },
          { initials: 'UR', name: 'Urgence', colorClass: 'bg-emerald-300' },
        ],
        extraAttendeesCount: 1,
        attendeesStatusLabel: 'objectif',
        amount: this.store.money(savings),
        amountVariant: 'positive',
        trendPeriodLabel: period,
        trendPercent: income ? `${Math.round((savings / income) * 100)} %` : '0 %',
        trendDirection: savings > 0 ? 'up' : 'flat',
        showPublishAction: true,
        editLabel: 'Objectifs',
        copyLabel: 'Copier',
        publishLabel: 'Contribuer',
      },
    ];
  });

  protected readonly recent = computed(() => this.store.transactions().slice(0, 6));
  protected readonly maxCategory = computed(() => Math.max(1, ...this.store.expenseByCategory().map((c) => c.amount)));

  onPeriod(item: AccountMenuItem): void {
    this.store.setPeriod(item.id as PeriodKey);
  }

  onCardEdit(card: EventCardItem): void {
    if (card.id === 'savings') {
      void this.router.navigateByUrl('/savings');
      return;
    }
    void this.router.navigateByUrl('/transactions');
  }

  async onCardCopy(card: EventCardItem): Promise<void> {
    await navigator.clipboard.writeText(card.amount);
    this.store.flash('Montant copié.');
  }

  onCardPublish(_card: EventCardItem): void {
    void this.router.navigateByUrl('/savings');
  }

  openForm(): void {
    this.draft.set(this.emptyDraft());
    this.formOpen.set(true);
  }

  save(draft: TransactionDraft): void {
    this.store.upsertTransaction({
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

  private ratioLabel(part: number, total: number): string {
    if (!total) {
      return '0 %';
    }
    return `${Math.round((part / total) * 100)} %`;
  }
}
