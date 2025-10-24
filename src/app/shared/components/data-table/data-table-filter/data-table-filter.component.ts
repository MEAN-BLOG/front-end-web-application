import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface FilterOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-data-table-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './data-table-filter.component.html',
  styleUrls: ['./data-table-filter.component.scss']
})
export class DataTableFilterComponent {
  @Input() searchable = true;
  @Input() searchLabel = '';
  @Input() searchPlaceholder = '';
  @Input() filters: Array<{
    key: string;
    label: string;
    options: FilterOption[];
  }> = [];
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChanged = new EventEmitter<{key: string, value: any[], selected: boolean}>();
  
  searchControl = new FormControl('');
  activeFilters: {[key: string]: Set<any>} = {};
  
  onSearch() {
    this.searchChange.emit(this.searchControl.value || '');
  }
  
  hasActiveFilters(): boolean {
    return Object.keys(this.activeFilters).length > 0 || !!this.searchControl.value;
  }

  clearAllFilters(): void {
    this.searchControl.setValue('');
    this.activeFilters = {};
    this.searchChange.emit('');
    this.filterChanged.emit({ key: 'all', value: [], selected: false });
  }

  onFilterChange(key: string, value: any, selected: boolean) {
    if (!this.activeFilters[key]) {
      this.activeFilters[key] = new Set();
    }
    
    if (selected) {
      this.activeFilters[key].add(value);
    } else {
      this.activeFilters[key].delete(value);
      if (this.activeFilters[key].size === 0) {
        delete this.activeFilters[key];
      }
    }
    
    this.filterChanged.emit({
      key,
      value: Array.from(this.activeFilters[key] || []),
      selected
    });
  }
  
  isSelected(key: string, value: any): boolean {
    return this.activeFilters[key]?.has(value) || false;
  }
  
  clearFilters() {
    this.activeFilters = {};
    this.searchControl.setValue('');
    this.searchChange.emit('');
    
    // Emit empty arrays for all filter keys
    for (const filter of this.filters) {
      this.filterChanged.emit({
        key: filter.key,
        value: [],
        selected: false
      });
    }
  }
}
