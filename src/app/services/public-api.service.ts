import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface PublicHomeResponse {
  hero?: any;
  about?: any;
  activities?: any[];
  services?: any[];
  testimonials?: any[];
  faq?: { page?: any; questions?: FaqQuestion[] };
}

export interface FaqQuestion {
  id?: number;
  question?: string;
  answer?: string;
  title?: string;
  content?: string;
}

export interface CmsPage {
  id: number;
  title?: string;
  name?: string;
  content?: string;
  body?: string;
  slug?: string;
}

export interface StandCarImage {
  url?: string;
  path?: string;
  thumb?: string;
}

export interface StandCar {
  id?: number;
  brand?: string;
  car_model?: string;
  fuel?: string;
  month?: string;
  origin?: string;
  status?: string;
  description?: string;
  price?: number | string | null;
  images?: Array<string | StandCarImage>;
}

export interface TransferTour {
  id?: number;
  name?: string;
  title?: string;
  description?: string;
  origin?: string;
  price?: number | string | null;
  duration?: string;
  photo?: Array<string | StandCarImage>;
}

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private baseUrl: string;
  private cache: Record<string, any> = {};

  constructor(private http: HttpClient) {
    const providedBase = environment.publicApiBaseUrl || 'https://expertcom.pt/api/v1/public';
    this.baseUrl = this.normalizeBase(providedBase);
  }

  getHome(forceRefresh = false): Observable<PublicHomeResponse> {
    return this.fetchAndCache<PublicHomeResponse>('/home', 'home', forceRefresh);
  }

  getPage(id: number, forceRefresh = false): Observable<{ data: CmsPage }> {
    return this.fetchAndCache<{ data: CmsPage }>(`/pages/${id}`, `page-${id}`, forceRefresh);
  }

  getStandCars(forceRefresh = false): Observable<{ data: StandCar[] }> {
    return this.fetchAndCache<{ data: StandCar[] }>('/stand-cars', 'stand-cars', forceRefresh);
  }

  getStandCar(id: number, forceRefresh = false): Observable<{ data: StandCar }> {
    return this.fetchAndCache<{ data: StandCar }>(`/stand-cars/${id}`, `stand-car-${id}`, forceRefresh);
  }

  getTransferTours(forceRefresh = false): Observable<{ data: TransferTour[] }> {
    return this.fetchAndCache<{ data: TransferTour[] }>('/transfer-tours', 'transfer-tours', forceRefresh);
  }

  getTransferTour(id: number, forceRefresh = false): Observable<{ data: TransferTour }> {
    return this.fetchAndCache<{ data: TransferTour }>(`/transfer-tours/${id}`, `transfer-tour-${id}`, forceRefresh);
  }

  private fetchAndCache<T>(endpoint: string, cacheKey: string, forceRefresh: boolean): Observable<T> {
    if (!forceRefresh) {
      const cached = this.fromCache<T>(cacheKey);
      if (cached) return of(cached);
    }

    return this.http.get<T>(`${this.baseUrl}${this.normalizeEndpoint(endpoint)}`).pipe(
      tap((resp) => this.persist(cacheKey, resp)),
      catchError((err) => {
        const fallback = this.fromCache<T>(cacheKey);
        if (fallback) return of(fallback);
        return throwError(() => err);
      })
    );
  }

  private normalizeBase(url: string): string {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  private normalizeEndpoint(endpoint: string): string {
    if (!endpoint.startsWith('/')) return `/${endpoint}`;
    return endpoint;
  }

  private persist(key: string, value: any) {
    this.cache[key] = value;
    try {
      localStorage.setItem(`public-cache:${key}`, JSON.stringify(value));
    } catch (_) {
      // Storage may be unavailable; fail silently.
    }
  }

  private fromCache<T>(key: string): T | null {
    if (this.cache[key]) return this.cache[key] as T;
    try {
      const saved = localStorage.getItem(`public-cache:${key}`);
      return saved ? (JSON.parse(saved) as T) : null;
    } catch (_) {
      return null;
    }
  }
}
