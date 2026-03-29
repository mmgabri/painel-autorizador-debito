import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorDialogComponent, ErrorDialogData } from '../../shared/components/error-dialog/error-dialog.component';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const notif = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          notif.error('Serviço indisponível. Verifique se o servidor está em execução.');
        } else {
          const body = error.error;
          if (body && typeof body.code === 'string' && typeof body.description === 'string') {
            dialog.open(ErrorDialogComponent, {
              data: { code: body.code, description: body.description } satisfies ErrorDialogData,
              width: '400px',
              panelClass: 'itau-dialog-panel',
            });
          } else {
            notif.error('Ocorreu um erro inesperado. Tente novamente.');
          }
        }
      }
      return throwError(() => error);
    }),
  );
};
