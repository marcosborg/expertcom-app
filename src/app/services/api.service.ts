import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  sandbox: boolean = false;
  baseUrl: string;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
  ) {
    this.baseUrl = this.sandbox ? 'http://127.0.0.1:8000/api/' : 'https://expertcom.pt/api/';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Accept-Language': 'pt'
    })
  };

  //PUBLIC

  login(data: any) {
    return this.http.post(this.baseUrl + 'login', data, this.httpOptions);
  }

  //PRIVATE

  panel(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.baseUrl + 'v1/panel', data, this.httpOptions);
  }

  panelCache: any = {};

  receipts(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.post(this.baseUrl + 'v1/receipts', data, this.httpOptions);
  }

}