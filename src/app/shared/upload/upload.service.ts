import { inject, Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private storage = inject(Storage);

  /**
   * Upload a single image file to Firebase Storage and return its public download URL.
   *
   * @description
   * This method generates a unique filename based on the current timestamp to avoid filename collisions.
   * After the upload to Firebase Storage completes,
   * the method resolves with the public HTTPS download URL which can then be stored in DB,
   * displayed in UI, or used as <img [src]="..."> binding.
   *
   * @param {File} file - The image file to upload (e.g. from file input or drag & drop).
   * @returns {Promise<string>} - A Promise that resolves to the public download URL.
   *
   * @example
   * ```ts
   * const url = await uploadService.uploadImage(selectedFile);
   * console.log('Download URL:', url); // => https://firebasestorage.googleapis.com/...
   * ```
   */
  async uploadImage(file: File): Promise<string> {
    const filePath = `uploads/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
