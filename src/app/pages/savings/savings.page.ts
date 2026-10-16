import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStore } from '../../core/finance.store';

@Component({
  selector: 'app-savings-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './savings.page.html',
})
export class SavingsPage {
  protected readonly store = inject(FinanceStore);
  protected readonly activeGoal = signal<string | null>(null);
  protected readonly amount = signal<number | null>(null);

  open(id: string): void {
    this.activeGoal.set(id);
    this.amount.set(10_000);
  }

  contribute(): void {
    const id = this.activeGoal();
    const value = Number(this.amount());
    if (!id || !value || value <= 0) {
      return;
    }
    this.store.contributeToGoal(id, value);
    this.activeGoal.set(null);
  }

  progress(saved: number, target: number): number {
    return Math.min(100, Math.round((saved / target) * 100));
  }
}
