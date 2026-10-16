import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface EventCardAvatar {
  initials: string;
  name: string;
  colorClass: string;
}

export type EventCardTrendDirection = 'up' | 'down' | 'flat';
export type EventCardAmountVariant = 'positive' | 'negative' | 'neutral';

export interface EventCardItem {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  isDraft: boolean;
  avatars: EventCardAvatar[];
  extraAttendeesCount: number;
  attendeesStatusLabel: string;
  amount: string;
  amountVariant: EventCardAmountVariant;
  trendPeriodLabel: string;
  trendPercent: string;
  trendDirection: EventCardTrendDirection;
  showPublishAction: boolean;
  editLabel?: string;
  copyLabel?: string;
  publishLabel?: string;
}

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class EventCardComponent {
  readonly cards = input<EventCardItem[]>([]);
  readonly stacked = input(false);
  readonly edit = output<EventCardItem>();
  readonly copy = output<EventCardItem>();
  readonly publish = output<EventCardItem>();

  protected amountClasses(variant: EventCardAmountVariant): string {
    switch (variant) {
      case 'positive':
        return 'text-[#C7F36B]';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-[#F4F3ED]';
    }
  }

  protected trendBadgeClasses(direction: EventCardTrendDirection): string {
    switch (direction) {
      case 'up':
        return 'bg-[#C7F36B]/15 text-[#C7F36B]';
      case 'down':
        return 'bg-red-500/15 text-red-300';
      default:
        return 'bg-white/8 text-[#9AA396]';
    }
  }

  protected onEditEvent(card: EventCardItem): void {
    this.edit.emit(card);
  }

  protected onCopyLink(card: EventCardItem): void {
    this.copy.emit(card);
  }

  protected onPublish(card: EventCardItem): void {
    this.publish.emit(card);
  }
}
