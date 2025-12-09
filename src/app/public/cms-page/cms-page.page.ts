import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { PublicApiService, CmsPage } from 'src/app/services/public-api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';

@Component({
  selector: 'app-cms-page',
  templateUrl: './cms-page.page.html',
  styleUrls: ['./cms-page.page.scss'],
  standalone: true,
  imports: [
    PublicHeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSkeletonText
]
})
export class CmsPagePage implements OnInit {
  page?: CmsPage;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private publicApi: PublicApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.load();
  }

  load(forceRefresh = false) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Página não encontrada.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.publicApi.getPage(id, forceRefresh).subscribe({
      next: (resp) => {
        this.page = resp?.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Não foi possível carregar a página.';
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.load(true);
    setTimeout(() => {
      (ev.target as HTMLIonRefresherElement | undefined)?.complete?.();
    }, 300);
  }

  title() {
    return this.page?.title || this.page?.name || 'Página';
  }

  backHome() {
    this.router.navigateByUrl('/home');
  }
}
