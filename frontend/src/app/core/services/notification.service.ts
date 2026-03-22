import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationSnackbarComponent, NotificationData } from '../../shared/components/notification-snackbar.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.open({ message, type: 'success' }, duration);
  }

  error(message: string, duration = 5000): void {
    this.open({ message, type: 'error' }, duration);
  }

  warn(message: string, duration = 4000): void {
    this.open({ message, type: 'warn' }, duration);
  }

  private open(data: NotificationData, duration: number): void {
    this.snackBar.openFromComponent(NotificationSnackbarComponent, {
      data,
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'itau-notif-panel',
    });
  }
}
