import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  constructor(
    private alertController: AlertController,
  ) { }

  errors(err: any) {
    let errors = err.error.errors;
    let errorMessages = '';
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        errors[field].forEach((message: string) => {
          errorMessages += `${message}. `;
        });
      }
    }
    this.alertController.create({
      header: 'Erro de validação',
      message: errorMessages,
    }).then((alert) => {
      alert.present();
    });
  }
}
