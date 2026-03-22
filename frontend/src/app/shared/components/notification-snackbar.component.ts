import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warn';

export interface NotificationData {
  message: string;
  type: NotificationType;
}

@Component({
  selector: 'app-notification-snackbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="notif-wrap notif-{{ data.type }}">
      <div class="notif-accent"></div>
      <mat-icon class="notif-icon">{{ icon }}</mat-icon>
      <span class="notif-message">{{ data.message }}</span>
      <button mat-icon-button class="notif-close" (click)="dismiss()" aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .notif-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px 0 0;
      border-radius: 8px;
      min-width: 300px;
      max-width: 480px;
      background: #fff;
      box-shadow: 0 4px 20px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.10);
      overflow: hidden;
      font-size: 13px;
      font-family: 'Segoe UI', Roboto, sans-serif;
    }

    .notif-accent {
      width: 5px;
      align-self: stretch;
      flex-shrink: 0;
      border-radius: 8px 0 0 8px;
    }

    .notif-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }

    .notif-message {
      flex: 1;
      line-height: 1.45;
      font-weight: 500;
      color: #1a1a1a;
      padding: 14px 0;
    }

    .notif-close {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      line-height: 32px;
      color: #777;
    }
    .notif-close:hover { color: #1a1a1a; }
    .notif-close .mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Success — Itaú green */
    .notif-success .notif-accent { background: #1a7a4a; }
    .notif-success .notif-icon   { color: #1a7a4a; }

    /* Error — red */
    .notif-error .notif-accent { background: #c62828; }
    .notif-error .notif-icon   { color: #c62828; }

    /* Warn — Itaú orange */
    .notif-warn .notif-accent { background: #ec7000; }
    .notif-warn .notif-icon   { color: #ec7000; }
  `],
})
export class NotificationSnackbarComponent {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef);

  get icon(): string {
    const map: Record<NotificationType, string> = {
      success: 'check_circle',
      error: 'error',
      warn: 'warning',
    };
    return map[this.data.type];
  }

  dismiss(): void {
    this.ref.dismiss();
  }
}
