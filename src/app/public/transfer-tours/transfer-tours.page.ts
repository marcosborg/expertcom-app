import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { airplaneOutline, imagesOutline } from 'ionicons/icons';
import { PublicApiService, TransferTour, StandCarImage } from 'src/app/services/public-api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';

@Component({
  selector: 'app-transfer-tours',
  templateUrl: './transfer-tours.page.html',
  styleUrls: ['./transfer-tours.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    PublicHeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSkeletonText,
  ]
})
export class TransferToursPage implements OnInit {
  tours: TransferTour[] = [];
  loading = false;
  error = '';
  placeholderImage = 'assets/logo.png';

  constructor(
    private publicApi: PublicApiService,
    private router: Router,
  ) {
    addIcons({ airplaneOutline, imagesOutline });
  }

  ngOnInit() {
    this.load();
  }

  load(forceRefresh = false) {
    this.loading = true;
    this.error = '';
    this.publicApi.getTransferTours(forceRefresh).subscribe({
      next: (resp) => {
        this.tours = resp?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível carregar os transfers/tours.';
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.load(true);
    setTimeout(() => {
      (ev.target as HTMLIonRefresherElement | undefined)?.complete?.();
    }, 300);
  }

  openDetail(tour: TransferTour) {
    if (!tour?.id) return;
    this.router.navigate(['/transfer-tours', tour.id]);
  }

  hero(tour: TransferTour) {
    if (!tour?.photo?.length) return this.placeholderImage;
    return this.resolveImage(tour.photo[0]);
  }

  resolveImage(media: string | StandCarImage | undefined) {
    if (!media) return this.placeholderImage;
    if (typeof media === 'string') return media;
    return media.url || media.path || media.thumb || this.placeholderImage;
  }

  subtitle(tour: TransferTour) {
    const bits = [tour.origin, tour.duration].filter(Boolean);
    return bits.join(' · ');
  }

  trackById(_i: number, tour: TransferTour) {
    return tour?.id || _i;
  }
}
