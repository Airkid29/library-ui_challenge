import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStore } from '../../core/finance.store';

@Component({
  selector: 'ui-confirmation-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-toast.html',
  styleUrl: './confirmation-toast.css',
})
export class ConfirmationToast {
  protected readonly store = inject(FinanceStore);
}
