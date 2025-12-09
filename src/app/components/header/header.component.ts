import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonImg,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonImg,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenuButton,
  ],
  standalone: true,
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    private alertController: AlertController,
    private preferences: PreferencesService,
  ) {
    addIcons({ logOutOutline });
  }

  ngOnInit() { 

  }

  onLogout() {
    this.alertController.create({
      message: 'Tem a certeza?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            this.preferences.removeName('access_token').then(() => {
              setTimeout(() => {
                this.router.navigateByUrl('/home');
              }, 1000);
            });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then((alert) => {
      alert.present();
    });

  }

}
