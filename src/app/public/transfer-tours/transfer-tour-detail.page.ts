import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, locationOutline, earthOutline, airplaneOutline } from 'ionicons/icons';
import { PublicApiService, TransferTour, StandCarImage } from 'src/app/services/public-api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';

@Component({
  selector: 'app-transfer-tour-detail',
  templateUrl: './transfer-tour-detail.page.html',
  styleUrls: ['./transfer-tour-detail.page.scss'],
  standalone: true,
  imports: [
    PublicHeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonChip,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText
]
})
export class TransferTourDetailPage implements OnInit {
  tour?: TransferTour;
  images: string[] = [];
  loading = false;
  error = '';
  placeholderImage = 'assets/logo.png';

  constructor(
    private route: ActivatedRoute,
    private publicApi: PublicApiService,
    private router: Router,
  ) {
    addIcons({ timeOutline, locationOutline, earthOutline, airplaneOutline });
  }

  ngOnInit() {
    this.load();
  }

  load(forceRefresh = false) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Transfer/tour não encontrado.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.publicApi.getTransferTour(id, forceRefresh).subscribe({
      next: (resp) => {
        this.tour = resp?.data;
        this.images = this.extractImages(this.tour?.photo || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível carregar o transfer/tour.';
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.load(true);
    setTimeout(() => {
      (ev.target as HTMLIonRefresherElement | undefined)?.complete?.();
    }, 300);
  }

  extractImages(list: Array<string | StandCarImage>) {
    if (!list?.length) return [this.placeholderImage];
    return list
      .map((m) => (typeof m === 'string' ? m : (m.url || m.path || m.thumb || this.placeholderImage)))
      .filter(Boolean);
  }

  title() {
    if (!this.tour) return 'Transfer/Tour';
    return this.tour.title || this.tour.name || 'Transfer/Tour';
  }

  subtitle() {
    const bits = [this.tour?.origin, this.tour?.duration].filter(Boolean);
    return bits.join(' · ');
  }

  backToList() {
    this.router.navigateByUrl('/transfer-tours');
  }
}
