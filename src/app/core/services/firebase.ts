import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';

// ONLY providers here. no getStorage() outside.
export const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  provideStorage(() => getStorage())
];
