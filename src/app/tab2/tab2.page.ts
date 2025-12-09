import { Component } from '@angular/core';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FunctionsService } from '../services/functions.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    HeaderComponent,
    CommonModule,
    FormsModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
  ]
})
export class Tab2Page {
  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController,
    private functions: FunctionsService
  ) { }

  access_token: any;
  status: string = 'unpaid';
  paid: any = [];
  unpaid: any = [];

  ionViewWillEnter() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/home');
      } else {
        this.loadingController.create().then((loading) => {
          loading.present();
          let data = {
            access_token: this.access_token
          }
          this.api.receipts(data).subscribe((resp: any) => {
            loading.dismiss();
            this.paid = resp.paid;
            this.unpaid = resp.unpaid;
          }, (err) => {
            this.functions.errors(err);
          });
        });
      }
    });
  }

  getReceipt(p: any) {
    let url = p.file.original_url ?? '#';
    window.location.href = url;
  }

}
