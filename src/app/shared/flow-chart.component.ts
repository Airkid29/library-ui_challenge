import { Component, input } from '@angular/core';

@Component({
  selector: 'app-flow-chart',
  standalone: true,
  template: `
    <svg viewBox="0 0 640 240" class="h-56 w-full" role="img" [attr.aria-label]="'Évolution des revenus et dépenses'">
      <rect width="640" height="240" fill="transparent" />
      @for (y of [40, 90, 140, 190]; track y) {
        <line x1="40" [attr.y1]="y" x2="620" [attr.y2]="y" stroke="rgba(244,243,237,0.08)" />
      }
      <polyline fill="none" stroke="#C7F36B" stroke-width="2.5" [attr.points]="incomePoints()" />
      <polyline fill="none" stroke="#f87171" stroke-width="2.5" [attr.points]="expensePoints()" />
      @for (point of dots(); track point.label + point.kind) {
        <circle [attr.cx]="point.x" [attr.cy]="point.y" r="3.5" [attr.fill]="point.kind === 'income' ? '#C7F36B' : '#f87171'" />
      }
      @for (label of labels(); track label.text) {
        <text [attr.x]="label.x" y="228" fill="#9AA396" font-size="11" text-anchor="middle">{{ label.text }}</text>
      }
    </svg>
    <div class="mt-2 flex gap-4 text-xs text-[#9AA396]">
      <span class="inline-flex items-center gap-2"><i class="h-2 w-2 rounded-full bg-[#C7F36B]"></i> Revenus</span>
      <span class="inline-flex items-center gap-2"><i class="h-2 w-2 rounded-full bg-red-400"></i> Dépenses</span>
    </div>
  `,
})
export class FlowChartComponent {
  readonly series = input<{ month: string; income: number; expense: number }[]>([]);

  private coords(kind: 'income' | 'expense'): string {
    const data = this.series();
    const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
    return data
      .map((d, i) => {
        const x = 40 + (i * 560) / Math.max(1, data.length - 1);
        const y = 190 - ((kind === 'income' ? d.income : d.expense) / max) * 140;
        return `${x},${y}`;
      })
      .join(' ');
  }

  incomePoints(): string {
    return this.coords('income');
  }

  expensePoints(): string {
    return this.coords('expense');
  }

  dots(): { x: number; y: number; kind: 'income' | 'expense'; label: string }[] {
    const data = this.series();
    const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
    return data.flatMap((d, i) => {
      const x = 40 + (i * 560) / Math.max(1, data.length - 1);
      return [
        { x, y: 190 - (d.income / max) * 140, kind: 'income' as const, label: d.month },
        { x, y: 190 - (d.expense / max) * 140, kind: 'expense' as const, label: d.month },
      ];
    });
  }

  labels(): { x: number; text: string }[] {
    const data = this.series();
    return data.map((d, i) => ({
      x: 40 + (i * 560) / Math.max(1, data.length - 1),
      text: d.month.slice(5),
    }));
  }
}
