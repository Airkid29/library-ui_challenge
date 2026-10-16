import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge' | 'progress' | 'actions';
  badgeColors?: { [key: string]: string };
}

export interface DataTableRow {
  [key: string]: unknown;
  selected?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  options?: { value: string; label: string }[];
  value?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css'],
})
export class DataTablePage {
  readonly title = input('Transactions');
  readonly subtitle = input('Historique filtrable, triable et paginé');
  readonly searchPlaceholder = input('Rechercher une description...');
  readonly addLabel = input('Ajouter');
  readonly columns = input<DataTableColumn[]>([]);
  readonly allData = input<DataTableRow[]>([]);
  readonly filters = input<FilterConfig[]>([]);
  readonly currencyFormatter = input<(value: number) => string>((value) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' F CFA',
  );

  readonly add = output<void>();
  readonly view = output<DataTableRow>();
  readonly edit = output<DataTableRow>();
  readonly remove = output<DataTableRow>();
  readonly exportRows = output<DataTableRow[]>();
  readonly bulkRemove = output<DataTableRow[]>();

  searchQuery = '';
  currentPage = 1;
  pageSize = 8;
  pageSizeOptions = [5, 8, 10, 25];
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectAll = false;

  get filteredData(): DataTableRow[] {
    let result = this.allData().map((row) => ({ ...row }));
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter((r) => String(r['description'] ?? r['product'] ?? '').toLowerCase().includes(q));
    }
    for (const filter of this.filters()) {
      if (filter.value) {
        result = result.filter((r) => String(r[filter.key]) === filter.value);
      }
    }
    if (this.sortColumn) {
      result.sort((a, b) => {
        const va = a[this.sortColumn];
        const vb = b[this.sortColumn];
        const cmp = va === vb ? 0 : (va as number | string) < (vb as number | string) ? -1 : 1;
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }

  get displayedData(): DataTableRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredData.length;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filters().forEach((f) => (f.value = ''));
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return this.filters().some((f) => !!f.value);
  }

  sortBy(column: DataTableColumn): void {
    if (!column.sortable) {
      return;
    }
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
  }

  getSortState(column: DataTableColumn): 'none' | 'asc' | 'desc' {
    if (!column.sortable || this.sortColumn !== column.key) {
      return 'none';
    }
    return this.sortDirection;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updateSelectAll();
    }
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.currentPage = 1;
  }

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const cur = this.currentPage;
    let start = Math.max(1, cur - 2);
    let end = Math.min(total, cur + 2);
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(total, start + 4);
      } else {
        start = Math.max(1, end - 4);
      }
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStartIndex(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  toggleSelectAll(): void {
    this.displayedData.forEach((r) => (r['selected'] = this.selectAll));
    const ids = new Set(this.displayedData.map((r) => r['id']));
    this.allData().forEach((r) => {
      if (ids.has(r['id'])) {
        r['selected'] = this.selectAll;
      }
    });
  }

  onRowSelect(row: DataTableRow): void {
    const source = this.allData().find((r) => r['id'] === row['id']);
    if (source) {
      source['selected'] = !!row['selected'];
    }
    this.updateSelectAll();
  }

  updateSelectAll(): void {
    this.selectAll = this.displayedData.length > 0 && this.displayedData.every((r) => r['selected']);
  }

  getSelectedCount(): number {
    return this.allData().filter((r) => r['selected']).length;
  }

  getBadgeColor(column: DataTableColumn, value: string): string {
    return column.badgeColors?.[value] || 'secondary';
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter()(value);
  }

  formatDate(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getStockPercentage(stock: number): number {
    return Math.min(100, stock);
  }

  getStockColor(stock: number): string {
    if (stock === 0) {
      return '#ef4444';
    }
    if (stock < 30) {
      return '#f59e0b';
    }
    return '#C7F36B';
  }

  cell(row: DataTableRow, key: string): string {
    return String(row[key] ?? '');
  }

  cellNumber(row: DataTableRow, key: string): number {
    return Number(row[key] ?? 0);
  }

  onView(row: DataTableRow): void {
    this.view.emit(row);
  }

  onEdit(row: DataTableRow): void {
    this.edit.emit(row);
  }

  onDelete(row: DataTableRow): void {
    this.remove.emit(row);
  }

  exportData(): void {
    this.exportRows.emit(this.filteredData);
  }

  deleteSelected(): void {
    this.bulkRemove.emit(this.allData().filter((r) => r['selected']));
  }

  onAdd(): void {
    this.add.emit();
  }
}
