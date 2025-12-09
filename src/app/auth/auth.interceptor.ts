import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PreferencesService } from '../services/preferences.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private preferences: PreferencesService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublic = req.url.includes('/v1/public');
    const hasAuthHeader = req.headers.has('Authorization');
    const apiBase = (environment.apiBaseUrl || '').replace(/\/$/, '');
    const matchesApiBase = apiBase && req.url.startsWith(apiBase);
    const isRelativeApi = !req.url.startsWith('http') && req.url.includes('/api/');

    if (isPublic || hasAuthHeader || (!matchesApiBase && !isRelativeApi)) {
      return next.handle(req);
    }

    return from(this.preferences.checkName('access_token')).pipe(
      switchMap((resp: any) => {
        const token = resp?.value;
        if (!token) return next.handle(req);
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next.handle(authReq);
      })
    );
  }
}
