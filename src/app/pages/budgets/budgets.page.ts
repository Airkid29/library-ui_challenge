import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStore } from '../../core/finance.store';

@Component({
  selector: 'app-budgets-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './budgets.page.html',
})
export class BudgetsPage {
  protected readonly store = inject(FinanceStore);
  protected readonly Math = Math;
  protected readonly editingId = signal<string | null>(null);
  protected readonly draftLimit = signal(0);

  startEdit(id: string, limit: number): void {
    this.editingId.set(id);
    this.draftLimit.set(limit);
  }

  save(): void {
    const id = this.editingId();
    if (!id || this.draftLimit() <= 0) {
      return;
    }
    this.store.updateBudget(id, Number(this.draftLimit()));
    this.editingId.set(null);
  }
}
