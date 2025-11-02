import { inject, Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private storage = inject(Storage); // <-- this is the correct Storage token

  async uploadImage(file: File): Promise<string> {
    const filePath = `uploads/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
