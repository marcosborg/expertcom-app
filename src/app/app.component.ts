import { Component } from '@angular/core';
import { PreferencesService } from './services/preferences.service'; // Adjust the path as needed
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
  IonButton,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

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
    IonButton,
    IonList,
    IonItem,
    CommonModule
  ]
})
export class AppComponent {

  access_token: string | null = null;

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
}
