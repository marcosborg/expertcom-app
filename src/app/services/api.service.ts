// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

// ⬇️ TIPOS / INTERFACES — FORA DA CLASSE
export type FormInputType = 'text' | 'number' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'photos';

export interface FormInput {
  id: number; label: string; name: string; type: FormInputType;
  required: boolean; position: number; form_name_id: number;
}

export interface FormName {
  id: number; name: string; description?: string | null;
  has_driver: boolean; has_license: boolean; has_technician: boolean;
  form_inputs: FormInput[];
}

export interface DrvSegmentDTO {
  kind: 'drive' | 'pause';
  started_at: string;  // 'YYYY-MM-DD HH:mm:ss' (hora local PT vinda do endpoint de logs)
  ended_at: string;    // idem
  duration_seconds: number;
  session_id: number;
}

export interface DrvSessionDTO {
  id: number;
  driver_id: number;
  status: 'running' | 'paused' | 'finished';
  started_at: string; // UTC
  ended_at?: string | null; // UTC
  total_drive_seconds: number;
  total_pause_seconds: number;
  segments?: any[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  sandbox = false;
  baseUrl: string;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
  ) {
    const fallback = this.sandbox ? 'http://127.0.0.1:8000/api/' : 'https://expertcom.pt/api/';
    const base = environment.apiBaseUrl || fallback;
    this.baseUrl = base.endsWith('/') ? base : `${base}/`;
  }

  private buildHeaders(extra: Record<string, string> = {}) {
    return {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        ...extra,
      }),
    };
  }

  // =========================
  // PUBLIC
  // =========================
  login(data: any) {
    return this.http.post(this.baseUrl + 'login', data, this.buildHeaders());
  }

  // =========================
  // PRIVATE (EXISTENTES)
  // =========================
  panel(data: any) {
    return this.http.post(
      this.baseUrl + 'v1/panel',
      data,
      this.buildHeaders({ Authorization: 'Bearer ' + data.access_token })
    );
  }

  panelCache: any = {};

  receipts(data: any) {
    return this.http.post(
      this.baseUrl + 'v1/receipts',
      data,
      this.buildHeaders({ Authorization: 'Bearer ' + data.access_token })
    );
  }

  forms(token: string) {
    return this.http.get(this.baseUrl + 'v1/forms', this.buildHeaders({ Authorization: 'Bearer ' + token }));
  }

  form(token: string, id: number) {
    return this.http.get(this.baseUrl + 'v1/forms/' + id, this.buildHeaders({ Authorization: 'Bearer ' + token }));
  }

  uploadPhoto(token: string, file: File) {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post(this.baseUrl + 'v1/forms/media', fd, { headers: new HttpHeaders({ Authorization: 'Bearer ' + token }) });
  }

  submitForm(token: string, payload: any) {
    return this.http.post(this.baseUrl + 'v1/forms/submit', payload, this.buildHeaders({ Authorization: 'Bearer ' + token }));
  }

  // =========================
  // DRIVE ENDPOINTS (NOVOS)
  // =========================
  driveStart(token: string, body: { lat?: number; lng?: number } = {}) {
    return this.http.post<{ session: DrvSessionDTO; current_segment: any }>(
      this.baseUrl + 'v1/drive/start',
      body,
      this.buildHeaders({ Authorization: 'Bearer ' + token })
    );
  }

  drivePause(token: string) {
    return this.http.post<{ session: DrvSessionDTO }>(
      this.baseUrl + 'v1/drive/pause',
      {},
      this.buildHeaders({ Authorization: 'Bearer ' + token })
    );
  }

  driveResume(token: string) {
    return this.http.post<{ session: DrvSessionDTO }>(
      this.baseUrl + 'v1/drive/resume',
      {},
      this.buildHeaders({ Authorization: 'Bearer ' + token })
    );
  }

  driveFinish(token: string, body: { lat?: number; lng?: number } = {}) {
    return this.http.post<{ session: DrvSessionDTO }>(
      this.baseUrl + 'v1/drive/finish',
      body,
      this.buildHeaders({ Authorization: 'Bearer ' + token })
    );
  }

  driveDailyLogs(token: string, dateISO: string) {
    // dateISO: YYYY-MM-DD (Europe/Lisbon)
    return this.http.get<{
      date: string;
      timezone: string;
      total_drive_seconds: number;
      total_pause_seconds: number;
      segments: DrvSegmentDTO[];
    }>(
      this.baseUrl + `v1/drive/logs?date=${dateISO}`,
      this.buildHeaders({ Authorization: 'Bearer ' + token })
    );
  }

  driveStatus(token: string) {
  return this.http.get<{
    active: boolean;
    status: 'idle'|'running'|'paused';
    running_segment_kind?: 'drive'|'pause';
    session: DrvSessionDTO | null;
    totals_now?: { total_drive_seconds: number; total_pause_seconds: number; };
  }>(
    this.baseUrl + 'v1/drive/status',
    this.buildHeaders({ Authorization: 'Bearer ' + token })
  );
}

}
