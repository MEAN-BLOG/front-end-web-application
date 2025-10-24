import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

interface BulkAction {
  id: string;
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  tooltip?: string;
}

@Component({
  selector: 'app-data-table-bulk-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './data-table-bulk-actions.component.html',
  styleUrls: ['./data-table-bulk-actions.component.scss']
})
export class DataTableBulkActionsComponent {
  @Input() selectedCount = 0;
  @Input() actions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete selected items'
    }
  ];
  
  @Output() action = new EventEmitter<{actionId: string, selectedCount: number}>();
  @Output() clear = new EventEmitter<void>();
  
  onActionClick(action: BulkAction) {
    if (action.disabled) return;
    this.action.emit({
      actionId: action.id,
      selectedCount: this.selectedCount
    });
  }
  
  clearSelection() {
    this.clear.emit();
  }
}
