import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorDialogComponent, ErrorDialogData } from '../../shared/components/error-dialog/error-dialog.component';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status !== 0) {
        const body = error.error;
        if (body && typeof body.code === 'string' && typeof body.description === 'string') {
          dialog.open(ErrorDialogComponent, {
            data: { code: body.code, description: body.description } satisfies ErrorDialogData,
            width: '400px',
            panelClass: 'itau-dialog-panel',
          });
        }
      }
      return throwError(() => error);
    }),
  );
};
