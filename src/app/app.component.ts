import { Component } from '@angular/core';
import { PreferencesService } from './services/preferences.service';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonMenuToggle,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    RouterModule,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonMenuToggle,
    IonList,
    IonItem,
    CommonModule
  ]
})
export class AppComponent {

  access_token: string | null = null;
  publicPagesMenu = environment.publicMenuPages;

  constructor(
    private preferences: PreferencesService,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.preferences.checkName('access_token').then((resp: any) => {
          this.access_token = resp.value;
        });
      });
  }

  ngOnInit() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
    });
  }

  get isLoggedIn() {
    return !!this.access_token;
  }
}
