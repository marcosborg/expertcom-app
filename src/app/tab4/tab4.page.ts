import { Component, OnDestroy } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DrvSessionDTO, DrvSegmentDTO } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { FunctionsService } from '../services/functions.service';

// Capacitor: para detetar quando a app regressa ao primeiro plano
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, IonContent],
})
export class Tab4Page implements OnDestroy {
  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController,
    private toast: ToastController,
    private functions: FunctionsService
  ) {}

  access_token = '';

  // estado da sessão/cronómetro
  session?: DrvSessionDTO;
  status: 'idle' | 'running' | 'paused' = 'idle';

  // contadores visuais da sessão
  elapsedDriveSeconds = 0;
  elapsedPauseSeconds = 0;
  tickInterval?: any;
  liveSinceEpoch = 0; // ms do último start/pause/resume

  // registo diário (autoridade)
  selectedDate: string = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  logs: DrvSegmentDTO[] = [];
  dailyDrive = 0;
  dailyPause = 0;
  loadingLogs = false;

  // handle do listener (Promise resolvida)
  private resumeHandle?: PluginListenerHandle;

  ionViewWillEnter() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp?.value ?? '';
      if (!this.access_token) {
        this.router.navigateByUrl('/home');
      } else {
        // carregar registo do dia atual
        this.loadDailyLogs();
        // sincronizar com o servidor (caso a app tenha sido fechada)
        this.syncFromServerStatus();
        // listener: app retomada do background
        this.attachResumeListener();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTicker();
    this.resumeHandle?.remove?.();
  }

  // ===== Helpers UI =====
  fmtDuration(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  private startTicker(kind: 'drive' | 'pause') {
  this.clearTicker();
  this.liveSinceEpoch = Date.now();

  // 🔸 congela os valores atuais do display como baseline
  const baseDrive = this.elapsedDriveSeconds;
  const basePause = this.elapsedPauseSeconds;

  this.tickInterval = setInterval(() => {
    const diff = Math.floor((Date.now() - this.liveSinceEpoch) / 1000);

    if (kind === 'drive') {
      // incrementa a partir do que já está no ecrã
      this.elapsedDriveSeconds = baseDrive + diff;
      this.elapsedPauseSeconds = basePause;
    } else {
      this.elapsedPauseSeconds = basePause + diff;
      this.elapsedDriveSeconds = baseDrive;
    }
  }, 1000);
}


  private clearTicker() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = undefined;
    }
  }

  private async toastMsg(message: string, color: 'success'|'warning'|'danger'|'medium'='success') {
    const t = await this.toast.create({ message, duration: 1400, color });
    t.present();
  }

  // ===== Ações cronómetro =====
  async start() {
    const loader = await this.loadingController.create({ message: 'A iniciar condução...' });
    await loader.present();
    this.api.driveStart(this.access_token, {}).subscribe({
      next: (res) => {
        this.session = res.session;
        this.status = 'running';
        this.elapsedDriveSeconds = this.session.total_drive_seconds;
        this.elapsedPauseSeconds = this.session.total_pause_seconds;
        this.startTicker('drive');
        this.toastMsg('Condução iniciada');
        loader.dismiss();
        this.loadDailyLogsSilently();
      },
      error: (err) => {
        loader.dismiss();
        // 409 → sessão já em curso
        if (err?.status === 409 && err?.error?.message) this.toastMsg(err.error.message, 'warning');
        else this.functions.errors(err);
      },
    });
  }

  async pauseOrResume() {
    if (this.status === 'running') {
      const loader = await this.loadingController.create({ message: 'A pausar...' });
      await loader.present();
      this.api.drivePause(this.access_token).subscribe({
        next: (res) => {
          this.session = res.session;
          this.status = 'paused';
          this.elapsedDriveSeconds = this.session.total_drive_seconds;
          this.elapsedPauseSeconds = this.session.total_pause_seconds;
          this.startTicker('pause');
          this.toastMsg('Pausa iniciada', 'warning');
          loader.dismiss();
          this.loadDailyLogsSilently();
        },
        error: (err) => {
          loader.dismiss();
          this.functions.errors(err);
        },
      });
    } else if (this.status === 'paused') {
      const loader = await this.loadingController.create({ message: 'A retomar...' });
      await loader.present();
      this.api.driveResume(this.access_token).subscribe({
        next: (res) => {
          this.session = res.session;
          this.status = 'running';
          this.elapsedDriveSeconds = this.session.total_drive_seconds;
          this.elapsedPauseSeconds = this.session.total_pause_seconds;
          this.startTicker('drive');
          this.toastMsg('Condução retomada');
          loader.dismiss();
          this.loadDailyLogsSilently();
        },
        error: (err) => {
          loader.dismiss();
          this.functions.errors(err);
        },
      });
    }
  }

  async finish() {
    const loader = await this.loadingController.create({ message: 'A terminar sessão...' });
    await loader.present();
    this.api.driveFinish(this.access_token, {}).subscribe({
      next: (res) => {
        this.session = res.session;
        this.status = 'idle';
        this.clearTicker();
        this.elapsedDriveSeconds = this.session.total_drive_seconds;
        this.elapsedPauseSeconds = this.session.total_pause_seconds;
        this.toastMsg('Sessão terminada', 'medium');
        loader.dismiss();
        this.loadDailyLogs();
      },
      error: (err) => {
        loader.dismiss();
        this.functions.errors(err);
      },
    });
  }

  // ===== Logs diários (autoridade) =====
  changeDate(delta: number) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + delta);
    this.selectedDate = d.toISOString().slice(0, 10);
    this.loadDailyLogs();
  }

  private loadDailyLogsSilently() {
    this.api.driveDailyLogs(this.access_token, this.selectedDate).subscribe({
      next: (res) => {
        this.logs = res.segments;
        this.dailyDrive = res.total_drive_seconds;
        this.dailyPause = res.total_pause_seconds;
      },
    });
  }

  loadDailyLogs() {
    this.loadingLogs = true;
    this.api.driveDailyLogs(this.access_token, this.selectedDate).subscribe({
      next: (res) => {
        this.logs = res.segments;
        this.dailyDrive = res.total_drive_seconds;
        this.dailyPause = res.total_pause_seconds;
        this.loadingLogs = false;
      },
      error: (err) => {
        this.loadingLogs = false;
        this.functions.errors(err);
      },
    });
  }

  // ===== Sincronizar com o servidor (app fechada/reaberta) =====
  private syncFromServerStatus() {
    this.api.driveStatus(this.access_token).subscribe({
      next: (res) => {
        if (!res.active || !res.session) {
          this.status = 'idle';
          this.session = undefined;
          this.clearTicker();
          this.elapsedDriveSeconds = 0;
          this.elapsedPauseSeconds = 0;
          return;
        }

        this.session = res.session;
        this.status = res.status; // 'running' | 'paused'

        // usar os totais do servidor “até agora”
        const t = res.totals_now;
        this.elapsedDriveSeconds = t?.total_drive_seconds ?? this.session.total_drive_seconds;
        this.elapsedPauseSeconds = t?.total_pause_seconds ?? this.session.total_pause_seconds;

        // reiniciar o ticker visual do lado certo
        const kind = res.running_segment_kind === 'pause' ? 'pause' : 'drive';
        this.startTicker(kind);
      },
      error: _ => {
        // silencioso; podes mostrar um toast se quiseres
      }
    });
  }

  private async attachResumeListener() {
    // evita listeners duplicados
    this.resumeHandle?.remove?.();
    this.resumeHandle = await App.addListener('resume', () => {
      if (this.access_token) {
        this.syncFromServerStatus();
        this.loadDailyLogsSilently();
      }
    });
  }
}
