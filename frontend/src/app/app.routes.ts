import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'simulador',
        loadChildren: () =>
          import('./features/simulador-bandeiras/routes').then(
            (m) => m.SIMULADOR_ROUTES,
          ),
      },
      {
        path: 'dispatcher',
        loadChildren: () =>
          import('./features/dispatcher-bandeiras/routes').then(
            (m) => m.DISPATCHER_ROUTES,
          ),
      },
      {
        path: 'transacoes',
        loadChildren: () =>
          import('./features/consulta-transacoes/routes').then(
            (m) => m.CONSULTA_ROUTES,
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard-debito/routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'massa-testes',
        loadChildren: () =>
          import('./features/massa-testes/routes').then(
            (m) => m.MASSA_TESTES_ROUTES,
          ),
      },
      { path: '', redirectTo: 'simulador', pathMatch: 'full' },
    ],
  },
];
