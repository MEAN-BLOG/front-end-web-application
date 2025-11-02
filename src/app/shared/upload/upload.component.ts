import { Component, EventEmitter, Output } from '@angular/core';
import { UploadService } from './upload.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  /**
   * Emits the final public download URL returned from Firebase
   * after a successful upload.
   */
  @Output() fileUploaded = new EventEmitter<string>();

  /** Indicates drag-over state to apply UI styling */
  isDragging = false;

  /** Indicates upload state to show loading spinner / disable UI */
  loading = false;

  constructor(private uploadService: UploadService) {}

  /**
   * Validate & upload an image file through the UploadService.
   * Emits the URL once done.
   *
   * @param {File} file - the selected image file
   */
  async handleFileInput(file: File) {
    if (!file || !file.type.startsWith('image/')) return;
    this.loading = true;
    const url = await this.uploadService.uploadImage(file);
    this.fileUploaded.emit(url);
    this.loading = false;
  }

  /**
   * Fired when the file is dropped into the dropzone.
   * Extracts first file and triggers upload.
   *
   * @param {DragEvent} e
   */
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFileInput(file);
  }

  /**
   * Dragover handler for dropzone.
   * Prevents default to enable drop action.
   *
   * @param {DragEvent} e
   */
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  /** Reset drag state when leaving the dropzone */
  onDragLeave() {
    this.isDragging = false;
  }

  /**
   * File input `<input type="file">` change handler.
   *
   * @param {Event} e - native change event
   */
  fileChange(e: any) {
    const file = e.target.files[0];
    if (file) this.handleFileInput(file);
  }
}
