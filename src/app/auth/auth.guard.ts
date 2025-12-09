import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { from, map } from 'rxjs';
import { PreferencesService } from '../services/preferences.service';

export const authGuard: CanActivateFn = () => {
  const preferences = inject(PreferencesService);
  const router = inject(Router);

  return from(preferences.checkName('access_token')).pipe(
    map((resp: any): boolean | UrlTree => {
      const token = resp?.value;
      if (token) return true;
      return router.createUrlTree(['/']);
    })
  );
};
