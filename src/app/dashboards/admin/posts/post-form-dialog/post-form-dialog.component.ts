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
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
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
import { UploadComponent } from 'src/app/shared/upload/upload.component';

export interface PostFormData {
  mode: 'create' | 'edit';
  post?: Post;
}

/**
 * PostFormDialogComponent
 *
 * Dialog component used for creating or editing a Post.
 * The component is fully reactive and implements:
 * - title/content validation (min/max lengths, trim check)
 * - optional image URL validation
 * - tags management with max count and invalid character checks
 * - create vs update submit flow with snackbar notifications
 *
 * This component is standalone and intended to be opened via MatDialog.
 */
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
    MatProgressSpinnerModule,
    UploadComponent,
  ],
  templateUrl: './post-form-dialog.html',
})
export class PostFormDialogComponent implements OnInit {
  /**
   * Reactive form group for post data (title, content, image, tags).
   * Initialized in the constructor via initForm() to match backend schema.
   */
  postForm: FormGroup;

  /**
   * Submission state flag.
   * When true, UI shows saving spinner and disables submit controls.
   */
  isSubmitting = false;

  /**
   * Predefined tag suggestions used by the autocomplete.
   */
  availableTags = ['Angular', 'JavaScript', 'TypeScript', 'Web', 'Design', 'UI/UX'];

  /**
   * Observable of filtered tags used by the autocomplete panel.
   * Populated in ngOnInit().
   */
  filteredTags!: Observable<string[]>;

  /**
   * Control backing the tag input used for filtering autocomplete options.
   */
  tagInputControl = new FormControl('');

  /**
   * Component constructor.
   *
   * @param fb FormBuilder used to create the reactive form.
   * @param dialogRef Reference to the opened MatDialog (used to close dialog).
   * @param data Injected dialog data (mode + optional post for edit).
   * @param postService Service used to create/update posts (HTTP I/O).
   * @param snackBar Material snackbar used to show success / error messages.
   *
   * Note: initForm() is invoked here to ensure postForm exists immediately.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<PostFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PostFormData,
    private readonly postService: PostService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.postForm = this.fb.group({});
    this.initForm();
  }

  /**
   * Angular lifecycle hook - component initialization.
   *
   * - wires up filteredTags observable for autocomplete
   * - if in edit mode, populates the form with the provided post data
   */
  ngOnInit(): void {
    this.filteredTags = this.tagInputControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );

    if (this.data.mode === 'edit' && this.data.post) {
      this.populateForm(this.data.post);
    }
  }

  /**
   * Filter helper for tag autocomplete.
   *
   * @param value input string to filter availableTags by
   * @returns list of matching tag suggestions (case-insensitive)
   */
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableTags.filter((tag) => tag.toLowerCase().includes(filterValue));
  }

  /**
   * Validator: ensures the control value does not include leading/trailing whitespace.
   * Returns `{ trim: true }` when the raw value differs from trimmed value.
   */
  private readonly trimValidator: ValidatorFn = (
    control: AbstractControl,
  ): { [key: string]: boolean } | null => {
    const value = control.value;
    return value && value.trim() !== value ? { trim: true } : null;
  };

  /**
   * Validator: optional URL validator for the image field.
   * Returns `{ url: true }` if value is present and not a valid URL.
   */
  private readonly urlValidator: ValidatorFn = (
    control: AbstractControl,
  ): { [key: string]: boolean } | null => {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  };

  /**
   * Validator: ensures tag value does not include forbidden characters (commas or new lines).
   * Returns `{ invalidChars: true }` when forbidden characters are detected.
   */
  private readonly tagValidator: ValidatorFn = (
    control: AbstractControl,
  ): { [key: string]: boolean } | null => {
    const val = control.value;
    return /[,\n]/.test(val) ? { invalidChars: true } : null;
  };

  /**
   * Validator: prohibits having more than 10 tags on the FormArray.
   * Returns `{ maxTags: true }` when the array length exceeds 10.
   */
  private readonly maxTagsValidator: ValidatorFn = (
    control: AbstractControl,
  ): { [key: string]: boolean } | null => {
    return control.value.length > 10 ? { maxTags: true } : null;
  };

  /**
   * Initialize the reactive form with validators that match backend constraints.
   *
   * - title: required, min 5, max 200, no leading/trailing whitespace
   * - content: required, min 50, max 20000
   * - image: optional URL
   * - tags: FormArray with maxTagsValidator
   */
  private initForm(): void {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(200),
          this.trimValidator,
        ],
      ],
      content: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(20000)]],
      image: ['', [this.urlValidator]],
      tags: this.fb.array([], [this.maxTagsValidator]),
    });
  }

  /**
   * Getter for the tags FormArray instance.
   *
   * @returns FormArray containing tag FormControls
   */
  get tagsArray(): FormArray {
    return this.postForm.get('tags') as FormArray;
  }

  /**
   * Add a tag to the tags FormArray.
   *
   * Accepts events from MatChipInputEvent (manual entry) or MatAutocompleteSelectedEvent (selection).
   * - Prevents duplicates
   * - Enforces a maximum of 10 tags
   * - Resets the input after successful addition
   *
   * @param event MatChipInputEvent | MatAutocompleteSelectedEvent
   */
  addTag(event: MatChipInputEvent | MatAutocompleteSelectedEvent): void {
    let value: string;
    let input: HTMLInputElement | undefined;

    if ('option' in event) {
      value = event.option.value;
    } else {
      value = (event.value || '').trim();
      input = event.input;
    }

    if (this.tagsArray.length >= 10) {
      if (input) input.value = '';
      this.tagInputControl.setValue(null);
      return;
    }

    if (value && !this.tagsArray.value.includes(value)) {
      this.tagsArray.push(new FormControl(value, [Validators.required, this.tagValidator]));
      this.tagsArray.updateValueAndValidity();
    }

    if (input) {
      input.value = '';
      this.tagInputControl.setValue(null);
    }
  }

  /**
   * Remove a tag at the specified index from the tags FormArray.
   *
   * @param index index of the tag to remove
   */
  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  /**
   * Submit handler for the form.
   *
   * - Validates the form and collects trimmed form data
   * - Sets `isSubmitting` to true while processing
   * - Routes the request to createPost or updatePost based on dialog mode
   */
  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formData = {
      title: this.postForm.get('title')?.value.trim(),
      content: this.postForm.get('content')?.value,
      image: this.postForm.get('image')?.value || '',
      tags: (this.postForm.get('tags')?.value || []).map((tag: string) => tag.trim()),
    };

    if (this.data.mode === 'create') {
      this.createPost(formData);
    } else if (this.data.mode === 'edit' && this.data.post?._id) {
      this.updatePost(this.data.post._id, formData);
    }
  }

  /**
   * Create a new post via PostService.
   *
   * Handles success and error responses, shows snackbars, and closes dialog on success.
   * Resets `isSubmitting` on failure.
   *
   * @param postData payload sent to the backend create endpoint
   */
  private createPost(postData: any): void {
    this.postService.createPost(postData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Post created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, data: response.data });
        } else {
          console.error('Failed to create post:', response.message);
          this.snackBar.open(`Failed to create post: ${response.message}`, 'Close', {
            duration: 5000,
          });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error creating post:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.isSubmitting = false;
      },
    });
  }

  /**
   * Update an existing post via PostService.
   *
   * Handles success and error responses, shows snackbars, and closes dialog on success.
   * Resets `isSubmitting` on failure.
   *
   * @param postId the id of the post to update
   * @param postData payload sent to the backend update endpoint
   */
  private updatePost(postId: string, postData: any): void {
    this.postService.updatePost(postId, postData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Post updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close({ success: true, data: response.data });
        } else {
          console.error('Failed to update post:', response.message);
          this.snackBar.open(`Failed to update post: ${response.message}`, 'Close', {
            duration: 5000,
          });
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error updating post:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred';
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        this.isSubmitting = false;
      },
    });
  }

  /**
   * Close dialog without saving.
   * Called by the cancel action.
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Open a media library (placeholder) and patch the image field.
   *
   * Currently a simple stub that patches a sample image URL.
   * Replace with actual media library integration as needed.
   */
  openMediaLibrary(): void {
    const sampleImageUrl = 'https://via.placeholder.com/800x400?text=Featured+Image';
    this.postForm.patchValue({
      image: sampleImageUrl,
    });
  }

  /**
   * Populate form controls with an existing Post model (edit mode).
   *
   * - patches title, content, image
   * - maps tags into a FormArray with validators
   *
   * @param post Post model used to populate the form
   */
  private populateForm(post: Post): void {
    this.postForm.patchValue({
      title: post.title,
      content: post.content,
      image: post.image || '',
    });

    if (post.tags && post.tags.length > 0) {
      const tagControls = post.tags.map(
        (tag) => new FormControl(tag, [Validators.required, this.tagValidator]),
      );
      this.postForm.setControl('tags', this.fb.array(tagControls, [this.maxTagsValidator]));
    }
  }

  /**
   * Called when UploadComponent emits the uploaded image URL.
   * Patches the image field on the form with the provided URL.
   *
   * @param url uploaded image URL
   */
  onImageUploaded(url: string) {
    this.postForm.patchValue({
      image: url,
    });
  }
}
