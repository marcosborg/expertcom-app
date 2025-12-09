import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { calendarOutline, carOutline, earthOutline, flashOutline, informationCircleOutline } from 'ionicons/icons';
import { PublicApiService, StandCar, StandCarImage } from 'src/app/services/public-api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';

@Component({
  selector: 'app-stand-car-detail',
  templateUrl: './stand-car-detail.page.html',
  styleUrls: ['./stand-car-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonSkeletonText,
  ]
})
export class StandCarDetailPage implements OnInit {
  car?: StandCar;
  loading = false;
  error = '';
  images: string[] = [];
  placeholderImage = 'assets/logo.png';

  constructor(
    private route: ActivatedRoute,
    private publicApi: PublicApiService,
    private router: Router,
  ) {
    addIcons({ carOutline, flashOutline, calendarOutline, earthOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.load();
  }

  load(forceRefresh = false) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Veiculo nao encontrado.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.publicApi.getStandCar(id, forceRefresh).subscribe({
      next: (resp) => {
        this.car = resp?.data;
        this.images = this.extractImages(this.car?.images || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Nao foi possivel carregar o veiculo.';
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
    if (!this.car) return 'Viatura';
    const brand = this.display(this.car.brand);
    const model = this.display(this.car.car_model);
    const combo = `${brand} ${model}`.trim();
    return combo || 'Viatura';
  }

  meta() {
    const bits = [
      this.display(this.car?.brand),
      this.display(this.car?.car_model),
      this.display(this.car?.fuel),
      this.display(this.car?.month),
      this.display(this.car?.origin),
    ].filter(Boolean);
    return bits.join(' · ');
  }

  backToList() {
    this.router.navigateByUrl('/stand-cars');
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

