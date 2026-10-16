import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FinanceStore } from '../core/finance.store';
import { AccountMenuComponent, AccountMenuItem } from '../library-ui/account-menu/account-menu.component';
import { ConfirmationToast } from '../library-ui/confirmation-toast/confirmation-toast';
import { CookieConsent3 } from '../library-ui/cookie-consent/cookie-consent-3';

@Component({
  selector: 'app-kori-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AccountMenuComponent, ConfirmationToast, CookieConsent3],
  templateUrl: './kori-shell.component.html',
  styleUrl: './kori-shell.component.scss',
})
export class KoriShellComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(FinanceStore);
  sidebarOpen = signal(false);

  navItems = [
    { icon: 'grid', label: 'Overview', path: '/' },
    { icon: 'book-open', label: 'Transactions', path: '/transactions' },
    { icon: 'calendar', label: 'Budgets', path: '/budgets' },
    { icon: 'layers', label: 'Savings Goals', path: '/savings' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ];

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.sidebarOpen.set(false));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  onMenu(item: AccountMenuItem): void {
    if (item.id === 'settings' || item.id === 'profile') {
      void this.router.navigateByUrl('/settings');
    } else if (item.id === 'community') {
      void this.router.navigateByUrl('/');
    } else if (item.id === 'subscription') {
      void this.router.navigateByUrl('/savings');
    } else if (item.id === 'help-center') {
      void this.router.navigateByUrl('/settings');
    } else if (item.id === 'sign-out') {
      this.store.resetDemo();
    }
  }

  onShare(): void {
    this.store.exportCsv(this.store.transactions());
  }
}
