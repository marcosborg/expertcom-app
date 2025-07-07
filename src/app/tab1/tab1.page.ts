import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FunctionsService } from '../services/functions.service';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    HeaderComponent,
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonButton,
  ]
})
export class Tab1Page {
  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController,
    private functions: FunctionsService,
  ) { }

  access_token: any;

  // Arrays para selects
  tvde_years: any[] = [];
  tvde_months: any[] = [];
  tvde_weeks: any[] = [];

  // IDs selecionados
  tvde_year_id: number | null = null;
  tvde_month_id: number | null = null;
  tvde_week_id: number | null = null;

  total_earnings_uber: string = '';
  contract_type_rank: any = null;
  total_uber: string = '';
  total_earnings_bolt: string = '';
  total_bolt: string = '';
  total_tips_uber: string = '';
  uber_tip_percent: number = 0;
  uber_tip_after_vat: string = '';
  total_tips_bolt: string = '';
  bolt_tip_percent: number = 0;
  bolt_tip_after_vat: string = '';
  total_earnings: number = 0;
  total_earnings_after_vat: number = 0;
  adjustments: any[] = [];
  total_after_vat: number = 0;
  final_total: number = 0;
  balance: number = 0;
  value: any;

  ionViewWillEnter() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/');
      } else {
        this.loadingController.create().then((loading) => {
          loading.present();
          const data = { access_token: this.access_token };
          this.api.panel(data).subscribe((resp: any) => {
            console.log(resp);
            loading.dismiss();
            this.api.panelCache = resp;
            this.total_earnings_uber = resp.total_earnings_uber;
            this.contract_type_rank = resp.contract_type_rank;
            this.total_uber = resp.total_uber;
            this.total_earnings_bolt = resp.total_earnings_bolt;
            this.total_bolt = resp.total_bolt;
            this.total_tips_uber = resp.total_tips_uber;
            this.uber_tip_percent = resp.uber_tip_percent;
            this.uber_tip_after_vat = resp.uber_tip_after_vat;
            this.total_tips_bolt = resp.total_tips_bolt;
            this.bolt_tip_percent = resp.bolt_tip_percent;
            this.bolt_tip_after_vat = resp.bolt_tip_after_vat;
            this.total_earnings = resp.total_earnings;
            this.total_earnings_after_vat = resp.total_earnings_after_vat;
            this.adjustments = resp.adjustments;
            this.total_after_vat = resp.total_after_vat;
            this.final_total = resp.final_total;
            this.balance = resp.driver_balance ? resp.driver_balance.balance : 0;

            // Preencher anos
            this.tvde_years = resp.tvde_years;

            // Selecionar ano corrente ou primeiro disponível
            const currentYear = new Date().getFullYear();
            const foundYear = this.tvde_years.find((y: any) => y.name === currentYear);
            this.tvde_year_id = foundYear ? foundYear.id : (this.tvde_years[0]?.id || null);

            // Filtrar meses para o ano selecionado
            this.tvde_months = resp.tvde_months.filter((m: any) => m.year_id === this.tvde_year_id);

            // Selecionar mês com base no tvde_month_id do payload
            const payloadMonthId = resp.tvde_month_id;
            const foundMonth = this.tvde_months.find((m: any) => m.id === payloadMonthId);
            this.tvde_month_id = foundMonth ? foundMonth.id : (this.tvde_months[0]?.id || null);

            // Filtrar semanas para o mês selecionado
            if (this.tvde_month_id) {
              this.tvde_weeks = resp.tvde_weeks.filter((w: any) => w.tvde_month_id === this.tvde_month_id);

              // Selecionar última semana do mês
              this.tvde_week_id = this.tvde_weeks.length ? this.tvde_weeks[this.tvde_weeks.length - 1].id : null;
            } else {
              this.tvde_weeks = [];
              this.tvde_week_id = null;
            }

          }, (err) => {
            loading.dismiss();
            this.functions.errors(err);
          });
        });
      }
    });
  }


  changeYear() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        tvde_year_id: this.tvde_year_id
      }
      this.api.panel(data).subscribe((resp: any) => {
        loading.dismiss();
        this.api.panelCache = resp;
        // Filtrar meses para o ano selecionado
        this.tvde_months = resp.tvde_months.filter((m: any) => m.year_id === this.tvde_year_id);
        this.tvde_weeks = [];
      }, (err) => {
        loading.dismiss();
        this.functions.errors(err);
      });
    });
  }

  changeMonth() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        tvde_month_id: this.tvde_month_id
      }
      this.api.panel(data).subscribe((resp: any) => {
        loading.dismiss();
        this.api.panelCache = resp;
        this.tvde_weeks = resp.tvde_weeks.filter((w: any) => w.tvde_month_id === this.tvde_month_id);
      }, (err) => {
        loading.dismiss();
        this.functions.errors(err);
      });
    });
  }

  changeWeek() {
    this.loadingController.create().then((loading) => {
      loading.present();
      let data = {
        access_token: this.access_token,
        tvde_week_id: this.tvde_week_id
      }
      this.api.panel(data).subscribe((resp: any) => {
        loading.dismiss();
        this.api.panelCache = resp;
        this.total_earnings_uber = resp.total_earnings_uber;
        this.contract_type_rank = resp.contract_type_rank;
        this.total_uber = resp.total_uber;
        this.total_earnings_bolt = resp.total_earnings_bolt;
        this.total_bolt = resp.total_bolt;
        this.total_tips_uber = resp.total_tips_uber;
        this.uber_tip_percent = resp.uber_tip_percent;
        this.uber_tip_after_vat = resp.uber_tip_after_vat;
        this.total_tips_bolt = resp.total_tips_bolt;
        this.bolt_tip_percent = resp.bolt_tip_percent;
        this.bolt_tip_after_vat = resp.bolt_tip_after_vat;
        this.total_earnings = resp.total_earnings;
        this.total_earnings_after_vat = resp.total_earnings_after_vat;
        this.adjustments = resp.adjustments;
        this.total_after_vat = resp.total_after_vat;
      }, (err) => {
        loading.dismiss();
        this.functions.errors(err);
      });
    });
  }

  formatWeek(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate().toString().padStart(2, '0')} a ${e.getDate().toString().padStart(2, '0')}`;
  }

}
