import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../../core/models/user.model';

export interface UserFormData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  roles = ['Admin', 'Editor', 'Author', 'Subscriber'];
  statuses = [
    { value: 'active', viewValue: 'Active' },
    { value: 'inactive', viewValue: 'Inactive' },
    { value: 'suspended', viewValue: 'Suspended' },
  ];
  isEditMode = false;
  avatarText = '';
  hidePassword = true;

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData,
  ) {
    this.isEditMode = this.data.mode === 'edit';
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['active', Validators.required],
      bio: [''],
      // Password is only required for new users
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      const { _id, updatedAt, createdAt, ...userData } = this.data.user;
      this.userForm.patchValue({
        ...userData,
        password: '', // Don't pre-fill password
      });
      this.avatarText = this.getInitials(userData.fullName);
    } else {
      this.userForm.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isSubmitting = true;

    // In a real app, you would call a service here
    setTimeout(() => {
      const formValue = this.userForm.value;
      const result = {
        ...formValue,
        // In a real app, you would hash the password before sending to the server
        ...(formValue.password ? { password: formValue.password } : {}),
      };

      this.dialogRef.close(result);
    }, 500);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Update avatar text when name changes
  onNameChange(name: string): void {
    this.avatarText = this.getInitials(name);
  }
}
