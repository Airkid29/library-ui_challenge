import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

export type MenuItemIcon = 'profile' | 'community' | 'subscription' | 'settings' | 'help' | 'sign-out';

export interface AccountMenuItem {
  id: string;
  label: string;
  icon: MenuItemIcon;
  badge?: string;
  dividerBefore?: boolean;
}

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-flex items-center gap-2',
  },
})
export class AccountMenuComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly avatarUrl = input('https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop');
  readonly buttonLabel = input('Période');
  readonly trigger = input<'avatar' | 'button'>('avatar');
  readonly items = input<AccountMenuItem[]>([
    { id: 'profile', label: 'Profil démo', icon: 'profile' },
    { id: 'community', label: 'Aperçu', icon: 'community' },
    { id: 'subscription', label: 'Objectifs', icon: 'subscription', badge: 'GOALS' },
    { id: 'settings', label: 'Paramètres', icon: 'settings' },
    { id: 'help-center', label: 'Méthode de calcul', icon: 'help', dividerBefore: true },
    { id: 'sign-out', label: 'Réinitialiser la démo', icon: 'sign-out' },
  ]);
  readonly selected = output<AccountMenuItem>();
  readonly share = output<void>();

  protected readonly isOpen = signal(false);
  protected readonly activeId = signal<string>('profile');

  @HostListener('document:click', ['$event.target'])
  protected onDocumentClick(target: EventTarget | null): void {
    if (this.isOpen() && target instanceof HTMLElement && !this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.isOpen.set(false);
  }

  protected toggleMenu(): void {
    this.isOpen.update((open) => !open);
  }

  protected selectItem(item: AccountMenuItem): void {
    this.activeId.set(item.id);
    this.isOpen.set(false);
    this.selected.emit(item);
  }

  protected onShare(): void {
    this.share.emit();
  }
}
