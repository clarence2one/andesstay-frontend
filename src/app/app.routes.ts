import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Reservations } from './pages/reservations/reservations';
import { Catalog } from './pages/catalog/catalog';
import { Reports } from './pages/reports/reports';
import { Audit } from './pages/audit/audit';

export const routes: Routes = [
  // Ruta pública
  { path: 'login', component: Login },

  // Rutas privadas protegidas
  { path: 'dashboard', component: Dashboard, canActivate: [MsalGuard] },
  { path: 'reservations', component: Reservations, canActivate: [MsalGuard] },
  { path: 'catalog', component: Catalog, canActivate: [MsalGuard] },
  { path: 'reports', component: Reports, canActivate: [MsalGuard] },
  { path: 'audit', component: Audit, canActivate: [MsalGuard] },

  // Redirecciones por defecto
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];