import { Component } from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FormName } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FunctionsService } from '../services/functions.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    HeaderComponent,
    CommonModule,
    FormsModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
  ]
})
export class Tab3Page {
  access_token!: string;
  loading = false;
  error: string | null = null;
  forms: FormName[] = [];

  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController,
    private functions: FunctionsService
  ) { }

  ionViewWillEnter() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp?.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/home');
      } else {
        this.loadForms();
      }
    });
  }

  async loadForms(refresher?: CustomEvent) {
    this.loading = !refresher; // se vier do refresher, usa o spinner do refresher
    this.error = null;

    this.api.forms(this.access_token).subscribe({
      next: (res: any) => {
        // API plana: { data: [...] }
        this.forms = (res?.data ?? []) as FormName[];
        this.loading = false;
        (refresher?.target as HTMLIonRefresherElement | undefined)?.complete?.();
      },
      error: () => {
        this.error = 'Não foi possível carregar os formulários.';
        this.loading = false;
        (refresher?.target as HTMLIonRefresherElement | undefined)?.complete?.();
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.loadForms(ev);
  }

  openForm(f: FormName) {
    // navega para /form-page/:id (sem depender de state)
    this.router.navigate(['/form-page', f.id]);
  }

  trackById(_i: number, f: FormName) { return f.id; }
}
