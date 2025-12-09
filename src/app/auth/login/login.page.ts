import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonImg,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonFooter,
  IonToolbar,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { FunctionsService } from 'src/app/services/functions.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonImg,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonFooter,
    IonToolbar,
    IonInputPasswordToggle,
  ]
})
export class LoginPage implements OnInit {

  constructor(
    private preferences: PreferencesService,
    private api: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private functions: FunctionsService
  ) { }

  data: any = {
    email: '',
    password: ''
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    
  }

  doLogin() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.login(this.data).subscribe((resp: any) => {
        loading.dismiss();
        this.preferences.setName('access_token', resp.access_token).then(() => {
          this.alertController.create({
            message: 'Bem vindo',
            backdropDismiss: false,
            buttons: [
              {
                text: 'Continuar',
                handler: () => {
                  this.router.navigateByUrl('tabs/tab1');
                }
              }
            ]
          }).then((alert) => {
            alert.present();
          });
        });
      }, (err) => {
        console.log(err);
        loading.dismiss();
        this.functions.errors(err);
      });
    });

  }

}
