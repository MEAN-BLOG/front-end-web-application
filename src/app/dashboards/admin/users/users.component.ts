import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of, Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, takeUntil, catchError } from 'rxjs/operators';

import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoleSelectionDialog } from '../../../shared/components/role-selection-dialog/role-selection-dialog';
import { User, UserRole } from '../../../core/models/user.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { DataTableColumnComponent } from '../../../shared/components/data-table/data-table-column/data-table-column.component';
import { DataTableFilterComponent } from '../../../shared/components/data-table/data-table-filter/data-table-filter.component';
import { DataTableBulkActionsComponent } from '../../../shared/components/data-table/data-table-bulk-actions/data-table-bulk-actions.component';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
  standalone: true,
  imports: [
    CommonModule,
    // Material modules
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    // Custom components
    DataTableComponent,
    DataTableColumnComponent,
    DataTableFilterComponent,
    DataTableBulkActionsComponent,

  ],
  providers: [
    DatePipe
  ]
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<User>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Table columns configuration
  tableColumns = [
    { columnDef: 'fullName', header: 'Full Name', sortable: true },
    { columnDef: 'email', header: 'Email', sortable: true },
    { columnDef: 'role', header: 'Role', sortable: true },
    { columnDef: 'status', header: 'Status', sortable: true },
    { columnDef: 'updatedAt', header: 'Last Updated', sortable: true },
    { columnDef: 'actions', header: 'Actions', sortable: false }
  ] as const;
  
  // Track if component is initialized
  private isInitialized = false;
  
  // Data
  users: User[] = [];
  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
  totalItems = 0;
  pageIndex = 0; // 0-based index for Material paginator
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  
  // Search and filters
  searchTerm = '';
  statusFilter = new Set<string>();
  roleFilter = new Set<string>();
  isLoading = false;
  
  // Filter options with proper typing
  filterOptions = {
    role: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'writer', label: 'Author' },
      { value: 'guest', label: 'Reader' }
    ]
  };
  
  // Bulk actions configuration
  bulkActions = [
    { id: 'update_role', label: 'Update Role', icon: 'manage_accounts' }
  ];
  
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userService: UserService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly datePipe: DatePipe
  ) {  }

  ngOnInit(): void {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadUsers();
    });
  }

  ngAfterViewInit(): void {
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    
    this.isInitialized = true;
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private applyFilters(): void {
    this.loadUsers();
  }
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onFilterChange(event: { key: string; value: any[]; selected: boolean }): void {
    if (event.key === 'status' || event.key === 'role') {
      if (event.key === 'status') {
        this.statusFilter = new Set(event.value);
      } else if (event.key === 'role') {
        this.roleFilter = new Set(event.value);
      }
      this.pageIndex = 0;
      this.loadUsers();
    }
  }
  
  onRowClick(user: User): void {
    console.log('User clicked:', user);
  }
  getRoleLabel(roleValue: string): string {
    if (!this.filterOptions?.role) return roleValue;
    const role = this.filterOptions.role.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  }

  updateUserRole(userId: string, newRole: string): void {
    this.userService.updateUserRole(userId, newRole as UserRole).subscribe({
      next: (response) => {
        if (response?.success) {
          this.snackBar.open('Role updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        }
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.snackBar.open('Failed to update role', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Get user initials for avatar
  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'medium') || 'Invalid date';
  }

  // Generate a consistent color based on the user's name
  getAvatarColor(name: string): string {
    if (!name) return '#cccccc';
    
    // Simple hash function to generate a consistent number from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (name.codePointAt(i) || 0) + ((hash << 5) - hash);
    }
    
    // Generate a color from the hash
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  // Open create user dialog
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { 
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('User created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadUsers();
      }
    });
  }

  // Open edit user dialog
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { 
        mode: 'edit',
        user: { ...user }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('User updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadUsers();
      }
    });
  }

  // Handle selection change
  onSelectionChange(selectedItems: User[]): void {
    this.selection.clear();
    selectedItems.forEach(item => this.selection.select(item));
  }
  
  // Clear selection
  clearSelection(): void {
    this.selection.clear();
  }

  // Handle bulk actions
  onBulkAction(event: { actionId: string; selectedCount: number }): void {
    const selectedUsers = this.selection.selected;
    const selectedIds = selectedUsers.map(user => user._id);
    
    if (event.actionId === 'update_role') {
      this.openRoleSelectionDialog(selectedIds);
    } else if (event.actionId === 'delete') {
      this.bulkDeleteSelected();
    }
  }

  // Open role selection dialog
  openRoleSelectionDialog(userIds: string[]): void {
    const dialogRef = this.dialog.open(RoleSelectionDialog, {
      width: '350px',
      panelClass: 'role-selection-dialog'
    });

    dialogRef.afterClosed().subscribe((role: string | undefined) => {
      if (role) {
        this.bulkUpdateRole(role, userIds);
      }
    });
  }

  // Bulk update user roles
  bulkUpdateRole(role: string, userIds: string[]): void {
    if (!userIds.length) return;

    const roleDisplay = this.filterOptions.role.find(r => r.value === role)?.label || role;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Role Update',
        message: `Are you sure you want to update ${userIds.length} user(s) to ${roleDisplay}?`,
        confirmText: 'Update',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const updateObservables = userIds.map(userId => 
          this.userService.updateUserRole(userId, role as UserRole).pipe(
            catchError(error => {
              console.error(`Error updating user ${userId}:`, error);
              return of({ success: false, message: error.message || 'Failed to update user role' });
            })
          )
        );

        forkJoin(updateObservables).subscribe(results => {
          const successCount = results.filter(r => r?.success).length;
          const failedCount = results.length - successCount;
          
          if (successCount > 0) {
            this.snackBar.open(
              `Updated ${successCount} user(s) to ${roleDisplay}`,
              'Close',
              { duration: 5000, panelClass: ['success-snackbar'] }
            );
          }
          
          if (failedCount > 0) {
            this.snackBar.open(
              `Failed to update ${failedCount} user(s)`,
              'Close',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
          }
          
          this.loadUsers();
          this.selection.clear();
        });
      }
    });
  }

  // Update user status
  updateUserStatus(userId: string, status: string): void {
    const selectedIds = new Set(this.selection.selected.map(user => user._id));
    this.bulkUpdateStatus(status, Array.from(selectedIds));
  }

  bulkUpdateStatus(status: string, userIds?: string[]): void {
    const selectedIds = new Set(userIds || this.selection.selected.map(user => user._id));

    this.applyFilters();
    this.selection.clear();

    this.snackBar.open(
      `${selectedIds.size} user(s) updated to ${status}`,
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteUser(user._id);
      }
    });
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter(user => user._id !== userId);
    this.applyFilters();

    this.snackBar.open('User deleted successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  bulkDeleteSelected(): void {
    const selectedUsers = this.selection.selected;

    if (selectedUsers.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Users',
        message: `Are you sure you want to delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const selectedIds = new Set(selectedUsers.map(user => user._id));
        this.users = this.users.filter(user => !selectedIds.has(user._id));
        
        this.snackBar.open(
          `${selectedUsers.length} user(s) deleted successfully`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        this.selection.clear();
      }
    });
  }

  loadUsers(): void {   
    if (!this.isInitialized) {
      return; // Skip initial load if not fully initialized
    }
    
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.isLoading = true;
      
      const params = {
        page: this.pageIndex + 1, // Convert to 1-based for API
        limit: this.pageSize,
        search: this.searchTerm,
        role: this.roleFilter.size > 0 ? Array.from(this.roleFilter).join(',') : undefined,
        status: this.statusFilter.size > 0 ? Array.from(this.statusFilter).join(',') : undefined
      };
      
      this.userService.getUsers(params).subscribe({
        next: (response: any) => {
          try {
            // Update users array and dataSource with the response data
            if (response?.success && response.data) {
              // Handle the successful response with the expected structure
              const usersData = response.data.data || [];
              
              // Update the data source
              this.users = Array.isArray(usersData) ? [...usersData] : [];
              this.dataSource.data = this.users;
              
              // Update sorting and pagination after data is loaded
              if (this.sort) {
                this.dataSource.sort = this.sort;
              }
              
              if (this.paginator) {
                this.dataSource.paginator = this.paginator;
              }
                            
              // Update pagination info if available
              if (response.data.pagination) {
                this.totalItems = response.data.pagination.total || 0;
                // Convert from 1-based to 0-based for Material paginator
                this.pageIndex = response.data.pagination.page ? response.data.pagination.page - 1 : 0;
                this.pageSize = response.data.pagination.limit || this.pageSize;
              } else {
                this.totalItems = this.users.length;
              }
            } else {
              console.warn('Unexpected API response format:', response);
              this.users = [];
              this.dataSource.data = [];
              this.totalItems = 0;
            }
          } catch (error) {
            console.error('Error processing API response:', error);
            this.users = [];
            this.dataSource.data = [];
            this.totalItems = 0;
          } finally {
            this.isLoading = false;
          }
        },
        error: (error: any) => {
          console.error('Error loading users:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            status: error.status,
            error: error.error
          });
          
          this.snackBar.open(
            'Failed to load users: ' + (error.error?.message || error.message || 'Unknown error'), 
            'Close', 
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
          
          this.isLoading = false;
          this.users = [];
          this.dataSource.data = [];
          this.totalItems = 0;
        }
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  // Check if all items are selected
  isAllSelected(): boolean {
    if (!this.dataTable?.data) return false;
    const numSelected = this.selection.selected.length;
    const numRows = this.dataTable.data.length;
    return numSelected === numRows && numRows > 0;
  }

  // Toggle all rows selection
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else if (this.dataTable?.data) {
      this.selection.select(...this.dataTable.data);
    }
  }

  // Get the label for a checkbox
  checkboxLabel(row?: User): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  // Get CSS class for status badge
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      default: return '';
    }
  }
}
