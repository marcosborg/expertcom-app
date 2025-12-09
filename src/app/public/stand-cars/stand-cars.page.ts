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
import { carOutline, chevronForwardOutline } from 'ionicons/icons';
import { PublicApiService, StandCar, StandCarImage } from 'src/app/services/public-api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';

@Component({
  selector: 'app-stand-cars',
  templateUrl: './stand-cars.page.html',
  styleUrls: ['./stand-cars.page.scss'],
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
export class StandCarsPage implements OnInit {
  cars: StandCar[] = [];
  loading = false;
  error = '';
  placeholderImage = 'assets/logo.png';

  constructor(
    private publicApi: PublicApiService,
    private router: Router,
  ) {
    addIcons({ carOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.loadCars();
  }

  loadCars(forceRefresh = false) {
    this.loading = true;
    this.error = '';
    this.publicApi.getStandCars(forceRefresh).subscribe({
      next: (resp) => {
        this.cars = resp?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível carregar os veículos do stand.';
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.loadCars(true);
    setTimeout(() => {
      (ev.target as HTMLIonRefresherElement | undefined)?.complete?.();
    }, 300);
  }

  openDetail(car: StandCar) {
    if (!car?.id) return;
    this.router.navigate(['/stand-cars', car.id]);
  }

  mainImage(car: StandCar) {
    if (!car?.images?.length) return this.placeholderImage;
    return this.resolveImage(car.images[0]);
  }

  resolveImage(media: string | StandCarImage | undefined) {
    if (!media) return this.placeholderImage;
    if (typeof media === 'string') return media;
    return media.url || media.path || media.thumb || this.placeholderImage;
  }

  meta(car: StandCar) {
    const bits = [
      this.display(car.brand),
      this.display(car.car_model),
      this.display(car.fuel),
      this.display(car.month),
      this.display(car.origin),
    ].filter(Boolean);
    return bits.join(' · ');
  }

  trackById(_i: number, car: StandCar) {
    return car?.id || _i;
  }

  display(val: any): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return (val as any).name || (val as any).label || (val as any).title || (val as any).value || '';
    }
    return '';
  }
}
