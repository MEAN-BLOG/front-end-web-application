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

  @Output() fileUploaded = new EventEmitter<string>();
  isDragging = false;
  loading = false;

  constructor(private uploadService: UploadService) {}

  async handleFileInput(file: File) {
    if (!file || !file.type.startsWith('image/')) return;
    this.loading = true;
    const url = await this.uploadService.uploadImage(file);
    this.fileUploaded.emit(url);
    this.loading = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFileInput(file);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  fileChange(e: any) {
    const file = e.target.files[0];
    if (file) this.handleFileInput(file);
  }
}
