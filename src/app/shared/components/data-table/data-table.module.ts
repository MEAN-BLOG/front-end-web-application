import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataTableComponent } from './data-table.component';
import { DataTableColumnComponent } from './data-table-column/data-table-column.component';
import { DataTableFilterComponent } from './data-table-filter/data-table-filter.component';
import { DataTableBulkActionsComponent } from './data-table-bulk-actions/data-table-bulk-actions.component';

// This module is now a simple wrapper that re-exports the standalone components
// along with their required Angular Material modules

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    // Import the standalone components
    DataTableComponent,
    DataTableColumnComponent,
    DataTableFilterComponent,
    DataTableBulkActionsComponent,
  ],
  exports: [
    // Re-export the standalone components
    DataTableComponent,
    DataTableColumnComponent,
    DataTableFilterComponent,
    DataTableBulkActionsComponent,
    // Re-export the Angular Material modules that are commonly needed
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
})
export class DataTableModule {}
