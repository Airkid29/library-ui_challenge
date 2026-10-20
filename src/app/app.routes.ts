import { Routes } from '@angular/router';
import { EcosaveShellComponent } from './layout/ecosave-shell.component';
import { OverviewPage } from './pages/overview/overview.page';
import { TransactionsPage } from './pages/transactions/transactions.page';
import { BudgetsPage } from './pages/budgets/budgets.page';
import { SavingsPage } from './pages/savings/savings.page';
import { SettingsPage } from './pages/settings/settings.page';

export const routes: Routes = [
  {
    path: '',
    component: EcosaveShellComponent,
    children: [
      { path: '', pathMatch: 'full', component: OverviewPage },
      { path: 'transactions', component: TransactionsPage },
      { path: 'budgets', component: BudgetsPage },
      { path: 'savings', component: SavingsPage },
      { path: 'settings', component: SettingsPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
