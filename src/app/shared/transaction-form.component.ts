import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../core/models';

export interface TransactionDraft {
  id?: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number | null;
  date: string;
  paymentMethod: Transaction['paymentMethod'];
  status: TransactionStatus;
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="fixed inset-0 z-60 flex items-end justify-center bg-black/55 p-4 sm:items-center">
      <form class="w-full max-w-lg rounded-2xl border border-white/8 bg-[#1D241E] p-5" (ngSubmit)="submit()">
        <h2 class="mb-4 text-lg font-semibold text-[#F4F3ED]">{{ draft().id ? 'Modifier la transaction' : 'Nouvelle transaction' }}</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="sm:col-span-2 text-xs text-[#9AA396]">Description
            <input required [(ngModel)]="draft().description" name="description" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none focus:border-[#C7F36B]" />
          </label>
          <label class="text-xs text-[#9AA396]">Type
            <select [(ngModel)]="draft().type" name="type" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none" (ngModelChange)="onTypeChange()">
              <option value="expense">Dépense</option>
              <option value="income">Revenu</option>
            </select>
          </label>
          <label class="text-xs text-[#9AA396]">Catégorie
            <select [(ngModel)]="draft().category" name="category" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none">
              @for (cat of categories(); track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </label>
          <label class="text-xs text-[#9AA396]">Montant (F CFA)
            <input required type="number" min="1" [(ngModel)]="draft().amount" name="amount" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none focus:border-[#C7F36B]" />
          </label>
          <label class="text-xs text-[#9AA396]">Date
            <input required type="date" [(ngModel)]="draft().date" name="date" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none" />
          </label>
          <label class="text-xs text-[#9AA396]">Moyen de paiement
            <select [(ngModel)]="draft().paymentMethod" name="paymentMethod" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none">
              @for (method of methods; track method) {
                <option [value]="method">{{ method }}</option>
              }
            </select>
          </label>
          <label class="text-xs text-[#9AA396]">Statut
            <select [(ngModel)]="draft().status" name="status" class="mt-1 w-full rounded-lg border border-white/10 bg-[#101310] px-3 py-2 text-sm text-[#F4F3ED] outline-none">
              <option value="completed">Confirmée</option>
              <option value="pending">En attente</option>
              <option value="failed">Échouée</option>
            </select>
          </label>
        </div>
        <div class="mt-5 flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold" (click)="closed.emit()">Annuler</button>
          <button type="submit" class="rounded-lg bg-[#C7F36B] px-4 py-2 text-sm font-semibold text-[#101310]">Enregistrer</button>
        </div>
      </form>
    </div>
  `,
})
export class TransactionFormComponent {
  readonly draft = input.required<TransactionDraft>();
  readonly saved = output<TransactionDraft>();
  readonly closed = output<void>();
  protected readonly methods = PAYMENT_METHODS;

  categories(): readonly string[] {
    return this.draft().type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  }

  onTypeChange(): void {
    const cats = this.categories();
    if (!cats.includes(this.draft().category)) {
      this.draft().category = cats[0];
    }
  }

  submit(): void {
    const amount = this.draft().amount;
    if (!this.draft().description.trim() || amount === null || amount <= 0) {
      return;
    }
    this.saved.emit(this.draft());
  }
}
