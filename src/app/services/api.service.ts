import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  sandbox: boolean = true;
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

  user(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/user', this.httpOptions);
  }

}