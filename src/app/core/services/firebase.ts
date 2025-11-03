import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';

/**
 * Firebase Provider Array
 *
 * @description
 * Centralized Firebase Angular providers used in `app.config.ts` / bootstrap.
 * This config:
 * - initializes Firebase App using environment firebase config
 * - provides Firebase Storage instance
 *
 * Note:
 * `getStorage()` is only allowed *inside* the provider factory.
 * Do not call `getStorage()` directly elsewhere — use DI (inject(Storage)) instead.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     firebaseProviders
 *   ]
 * });
 * ```
 */
export const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  provideStorage(() => getStorage()),
];
