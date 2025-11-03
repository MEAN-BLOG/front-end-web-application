import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ContentChildren,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { DataTableColumnComponent } from './data-table-column/data-table-column.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T> implements AfterViewInit, OnChanges {
  @Input() set data(value: T[]) {
    this._data = value || [];
    this.updateDataSource();
  }
  get data(): T[] {
    return this._data;
  }
  private _data: T[] = [];

  @Input() set loading(value: boolean) {
    this._loading = value;
  }
  get loading(): boolean {
    return this._loading;
  }
  private _loading = false;

  @Input() selectable = false; // Default to false to prevent duplicate select column
  @Input() pagination = true;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 100];
  @Input() pageIndex = 0;
  @Input() totalItems = 0;
  @Input() emptyStateTemplate: any;

  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  @ViewChildren(MatSort) sort!: MatSort;
  @ContentChildren(DataTableColumnComponent) columnDefs!: QueryList<DataTableColumnComponent>;

  dataSource = new MatTableDataSource<T>([]);
  selection = new SelectionModel<T>(true, []);
  displayedColumns: string[] = [];
  columns: DataTableColumnComponent[] = [];

  private updateDataSource(): void {
    if (this.dataSource) {
      this.dataSource.data = this.data;
    } else {
      this.dataSource = new MatTableDataSource<T>(this.data);
    }
  }

  ngAfterViewInit() {
    // Initial update of columns
    this.updateDisplayedColumns();

    // Subscribe to column changes
    this.columnDefs.changes.subscribe(() => {
      this.updateDisplayedColumns();
    });

    // Initial data update
    this.updateDataSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('data' in changes) {
      this.updateDataSource();
    }
  }

  updateDisplayedColumns() {
    if (this.columnDefs) {
      this.columns = this.columnDefs.toArray();
      this.displayedColumns = [
        ...(this.selectable ? ['select'] : []),
        ...this.columns.map((c) => c.columnDef),
      ];
    }
  }

  onRowClick(row: T) {
    this.rowClick.emit(row);
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSortData(sort: Sort) {
    this.sortChange.emit(sort);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
    this.selectionChange.emit(this.selection.selected);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: T): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
}
