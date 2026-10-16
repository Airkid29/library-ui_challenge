import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceStore } from '../../core/finance.store';

@Component({
  selector: 'app-cookie-consent-3',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookie-consent-3.html',
  styleUrl: './cookie-consent-3.css',
})
export class CookieConsent3 {
  private readonly store = inject(FinanceStore);

  get visible(): boolean {
    return this.store.consent() === 'unknown';
  }

  accept(): void {
    this.store.acceptLocalStorage();
  }

  decline(): void {
    this.store.declineLocalStorage();
  }
}
