import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

export interface RoleOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-role-selection-dialog',
  templateUrl: './role-selection-dialog.html',
  styleUrls: ['./role-selection-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
})
export class RoleSelectionDialog {
  roles: RoleOption[] = [
    { value: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
    { value: 'editor', label: 'Editor', icon: 'edit_note' },
    { value: 'writer', label: 'Author', icon: 'article' },
    { value: 'guest', label: 'Reader', icon: 'person' },
  ];

  selectedRole: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<RoleSelectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  selectRole(role: string): void {
    this.selectedRole = role;
    this.dialogRef.close(role);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
