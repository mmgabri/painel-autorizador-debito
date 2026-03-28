import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmar-exclusao-dispatcher-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon-wrap">
        <mat-icon class="confirm-icon">delete_outline</mat-icon>
      </div>
      <h2 class="confirm-title">Excluir evento</h2>
      <p class="confirm-message">Tem certeza que deseja excluir este evento?<br>Esta ação não poderá ser desfeita.</p>
      <div class="confirm-actions">
        <button class="btn-cancelar" (click)="dialogRef.close(false)">Cancelar</button>
        <button class="btn-confirmar" (click)="dialogRef.close(true)">Excluir</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 28px 20px;
      text-align: center;
      max-width: 320px;
    }
    .confirm-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(198, 40, 40, 0.08);
      border: 1px solid rgba(198, 40, 40, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .confirm-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #c62828;
    }
    .confirm-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 8px;
    }
    .confirm-message {
      font-size: 13px;
      color: #555;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    :host-context(html.dark-theme) .confirm-title {
      color: #f3f4f6;
    }

    :host-context(html.dark-theme) .confirm-message {
      color: #d1d5db;
    }

    .confirm-actions {
      display: flex;
      gap: 12px;
    }
    .btn-cancelar {
      padding: 8px 20px;
      border: 1px solid #ccc;
      background: transparent;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      color: #555;
      font-weight: 500;
    }
    .btn-cancelar:hover { background: #f5f5f5; }
    .btn-confirmar {
      padding: 8px 20px;
      border: none;
      background: #c62828;
      color: #fff;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-confirmar:hover { background: #b71c1c; }
  `],
})
export class ConfirmarExclusaoDispatcherDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmarExclusaoDispatcherDialogComponent>);
}
