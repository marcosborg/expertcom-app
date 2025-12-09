import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, timeOutline, globeOutline, helpCircleOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';
import { PublicApiService, PublicHomeResponse, FaqQuestion } from 'src/app/services/public-api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    PublicHeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonSkeletonText,
    IonAccordionGroup,
    IonAccordion,
  ]
})
export class StartPage implements OnInit {
  homeData?: PublicHomeResponse;
  loadingHome = false;
  homeError = '';
  isLoggedIn = false;

  slidesOpts = { slidesPerView: 1.05, spaceBetween: 12, autoplay: { delay: 3500 } };
  cmsMenu = environment.publicMenuPages;

  constructor(
    private preferences: PreferencesService,
    private publicApi: PublicApiService,
    private router: Router,
  ) {
    addIcons({ starOutline, timeOutline, globeOutline, helpCircleOutline });
  }

  async ngOnInit() {
    await this.checkLogin();
    this.loadHome();
  }

  ionViewWillEnter() {
    this.checkLogin();
  }

  async checkLogin() {
    const resp = await this.preferences.checkName('access_token');
    this.isLoggedIn = !!resp?.value;
  }

  loadHome(forceRefresh = false) {
    this.loadingHome = true;
    this.homeError = '';
    this.publicApi.getHome(forceRefresh).subscribe({
      next: (resp) => {
        this.homeData = resp;
        this.loadingHome = false;
      },
      error: () => {
        this.loadingHome = false;
        this.homeError = 'Não foi possível carregar os destaques.';
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.loadHome(true);
    setTimeout(() => {
      (ev?.target as HTMLIonRefresherElement | undefined)?.complete?.();
    }, 300);
  }

  openAuth() {
    this.router.navigateByUrl(this.isLoggedIn ? '/tabs/tab1' : '/login');
  }

  goToStandCars() {
    this.router.navigateByUrl('/stand-cars');
  }

  goToTransfers() {
    this.router.navigateByUrl('/transfer-tours');
  }

  openCmsPage(pageId: number) {
    if (!pageId) return;
    this.router.navigate(['/pages', pageId]);
  }

  heroTitle() {
    const hero = this.homeData?.hero || {};
    return hero.title || hero.name || 'Mobilidade que trabalha por si';
  }

  heroSubtitle() {
    const hero = this.homeData?.hero || {};
    return hero.subtitle || hero.description || hero.body || 'Conheça os nossos serviços, frota e soluções de transferência.';
  }

  heroImage() {
    const hero = this.homeData?.hero || {};
    return this.extractImage(hero) || 'assets/logo-header.png';
  }

  extractImage(item: any) {
    const media = item?.image || item?.banner || item?.cover || item?.background || item?.photo || item?.photos || item?.media;
    return this.resolveMedia(media);
  }

  itemTitle(item: any) {
    return item?.title || item?.name || item?.label || 'Sem título';
  }

  itemDescription(item: any) {
    return item?.subtitle || item?.description || item?.body || item?.content || '';
  }

  faqQuestions(): FaqQuestion[] {
    return this.homeData?.faq?.questions || [];
  }

  faqTitle() {
    return this.homeData?.faq?.page?.title || this.homeData?.faq?.page?.name || 'Perguntas frequentes';
  }

  trackByIndex(_i: number, _item: any) {
    return _i;
  }

  private resolveMedia(media: any): string {
    if (!media) return '';
    if (Array.isArray(media)) return this.resolveMedia(media[0]);
    if (typeof media === 'string') return this.asAbsolute(media);
    if (typeof media === 'object') {
      const candidate = media.url || media.path || media.thumb || media.src || media.href;
      if (candidate) return this.asAbsolute(candidate);
    }
    return '';
  }

  private asAbsolute(url: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = (environment.publicApiBaseUrl || '').replace(/\/api\/v1\/public\/?$/, '').replace(/\/$/, '');
    if (!base) return url;
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }
}
