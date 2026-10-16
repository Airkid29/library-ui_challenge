import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceStore } from '../../core/finance.store';
import { DisplayCurrency } from '../../core/models';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  protected readonly store = inject(FinanceStore);
  protected readonly currencies: DisplayCurrency[] = ['XOF', 'EUR', 'USD'];

  onCurrency(value: string): void {
    this.store.setCurrency(value as DisplayCurrency);
  }
}
