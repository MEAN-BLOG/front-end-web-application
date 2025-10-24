import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { 
  FormBuilder, 
  FormControl, 
  FormGroup, 
  Validators, 
  FormArray, 
  AbstractControl,
  ValidatorFn, 
  ReactiveFormsModule
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, map, startWith } from 'rxjs';
import { Post } from '../../../../core/models/post.model';
import { PostService } from '../../../../shared/services/post.service';
import { CommonModule } from '@angular/common';

export interface PostFormData {
  mode: 'create' | 'edit';
  post?: Post;
}

@Component({
  selector: 'app-post-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './post-form-dialog.html',
  styleUrls: ['./post-form-dialog.scss']
})
export class PostFormDialogComponent implements OnInit {
  postForm: FormGroup;
  isSubmitting = false;
  
  availableTags = ['Angular', 'JavaScript', 'TypeScript', 'Web', 'Design', 'UI/UX'];
  filteredTags!: Observable<string[]>;
  tagInputControl = new FormControl('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<PostFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostFormData,
    private readonly postService: PostService,
    private readonly snackBar: MatSnackBar
  ) {
    this.postForm = this.fb.group({});
    this.initForm();
  }

  ngOnInit(): void {
    // Initialize filtered tags
    this.filteredTags = this.tagInputControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    if (this.data.mode === 'edit' && this.data.post) {
      this.populateForm(this.data.post);
    }
  }
  
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableTags.filter(tag => 
      tag.toLowerCase().includes(filterValue)
    );
  }

  // Custom validators with proper typing
  private readonly trimValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value;
    return value && value.trim() !== value ? { trim: true } : null;
  }

  private readonly urlValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    if (!control.value) return null; // Optional field
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  }

  private readonly tagValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const val = control.value;
    return /[,\n]/.test(val) ? { invalidChars: true } : null;
  }

  private readonly maxTagsValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    return control.value.length > 10 ? { maxTags: true } : null;
  }

  // Initialize the form with validation matching backend schema
  private initForm(): void {
    this.postForm = this.fb.group({
      title: [
        '', 
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(200),
          this.trimValidator
        ]
      ],
      content: [
        '', 
        [
          Validators.required,
          Validators.minLength(50),
          Validators.maxLength(20000)
        ]
      ],
      image: [
        '',
        [this.urlValidator]
      ],
      tags: this.fb.array([], [this.maxTagsValidator])
    });
  }

  // Get tags form array
  get tagsArray(): FormArray {
    return this.postForm.get('tags') as FormArray;
  }

  // Add/remove tags
  addTag(event: MatChipInputEvent | MatAutocompleteSelectedEvent): void {
    let value: string;
    let input: HTMLInputElement | undefined;
    
    if ('option' in event) {
      // Handle autocomplete selection
      value = event.option.value;
    } else {
      // Handle chip input
      value = (event.value || '').trim();
      input = event.input;
    }

    // Don't add if we already have 10 tags
    if (this.tagsArray.length >= 10) {
      if (input) input.value = '';
      this.tagInputControl.setValue(null);
      return;
    }

    // Add tag if it's not empty and not already in the list
    if (value && !this.tagsArray.value.includes(value)) {
      this.tagsArray.push(new FormControl(value, [
        Validators.required,
        this.tagValidator
      ]));
      this.tagsArray.updateValueAndValidity();
    }
    
    // Reset the input value
    if (input) {
      input.value = '';
      this.tagInputControl.setValue(null);
    }
  }

  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    
    // Prepare form data
    const formData = {
      title: this.postForm.get('title')?.value.trim(),
      content: this.postForm.get('content')?.value,
      image: this.postForm.get('image')?.value || '',
      tags: (this.postForm.get('tags')?.value || []).map((tag: string) => tag.trim())
    };

    if (this.data.mode === 'create') {
      this.createPost(formData);
    } else if (this.data.mode === 'edit' && this.data.post?._id) {
      this.updatePost(this.data.post._id, formData);
    }
  }

  // Create a new post
  private createPost(postData: any): void {
    this.postService.createPost(postData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Post created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, data: response.data });
        } else {
          console.error('Failed to create post:', response.message);
          this.snackBar.open(`Failed to create post: ${response.message}`, 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error creating post:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  // Update an existing post
  private updatePost(postId: string, postData: any): void {
    this.postService.updatePost(postId, postData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Post updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, data: response.data });
        } else {
          console.error('Failed to update post:', response.message);
          this.snackBar.open(`Failed to update post: ${response.message}`, 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error updating post:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  openMediaLibrary(): void {
    const sampleImageUrl = 'https://via.placeholder.com/800x400?text=Featured+Image';
    this.postForm.patchValue({
      image: sampleImageUrl
    });
  }

  private populateForm(post: Post): void {
    this.postForm.patchValue({
      title: post.title,
      content: post.content,
      image: post.image || ''
    });

    // Set tags with validation
    if (post.tags && post.tags.length > 0) {
      const tagControls = post.tags.map(tag => 
        new FormControl(tag, [
          Validators.required,
          this.tagValidator
        ])
      );
      this.postForm.setControl('tags', this.fb.array(tagControls, [
        this.maxTagsValidator
      ]));
    }
  }
}
