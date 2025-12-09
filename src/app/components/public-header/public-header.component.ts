import { CommonModule, Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
} from '@ionic/angular/standalone';
import { PreferencesService } from 'src/app/services/preferences.service';
import { addIcons } from 'ionicons';
import { chevronBackOutline, logInOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonImg],
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss'],
})
export class PublicHeaderComponent implements OnInit {
  @Input() title = '';
  @Input() showBack = false;

  isLoggedIn = false;

  constructor(
    private preferences: PreferencesService,
    private router: Router,
    private location: Location,
  ) {
    addIcons({ chevronBackOutline, logInOutline, personCircleOutline });
  }

  async ngOnInit() {
    const token = await this.preferences.checkName('access_token');
    this.isLoggedIn = !!token?.value;
  }

  openAuth() {
    if (this.isLoggedIn) {
      this.router.navigateByUrl('/tabs/tab1');
      return;
    }
    this.router.navigateByUrl('/login');
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  goBack() {
    this.location.back();
  }
}
