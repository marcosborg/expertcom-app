import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./auth/start/start.page').then(m => m.StartPage)
  },
  {
    path: 'home',
    pathMatch: 'full',
    redirectTo: '',
  },
  {
    path: 'stand-cars',
    loadComponent: () => import('./public/stand-cars/stand-cars.page').then(m => m.StandCarsPage)
  },
  {
    path: 'stand-cars/:id',
    loadComponent: () => import('./public/stand-cars/stand-car-detail.page').then(m => m.StandCarDetailPage)
  },
  {
    path: 'transfer-tours',
    loadComponent: () => import('./public/transfer-tours/transfer-tours.page').then(m => m.TransferToursPage)
  },
  {
    path: 'transfer-tours/:id',
    loadComponent: () => import('./public/transfer-tours/transfer-tour-detail.page').then(m => m.TransferTourDetailPage)
  },
  {
    path: 'pages/:id',
    loadComponent: () => import('./public/cms-page/cms-page.page').then(m => m.CmsPagePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'form-page/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/form-page/form-page.page').then( m => m.FormPagePage)
  },
  {
    path: '**',
    redirectTo: '',
  },

];
