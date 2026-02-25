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
          import('./features/simulador-autorizador-debito/routes').then(
            (m) => m.SIMULADOR_ROUTES,
          ),
      },
      {
        path: 'transacoes',
        loadChildren: () =>
          import('./features/consulta-transacoes/routes').then(
            (m) => m.CONSULTA_ROUTES,
          ),
      },
      { path: '', redirectTo: 'simulador', pathMatch: 'full' },
    ],
  },
];
