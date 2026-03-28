import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmar-exclusao-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon-wrap">
        <mat-icon class="confirm-icon">delete_outline</mat-icon>
      </div>
      <h2 class="confirm-title">Excluir cenário</h2>
      <p class="confirm-message">Tem certeza que deseja excluir este cenário?<br>Esta ação não poderá ser desfeita.</p>
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
      color: #888;
      line-height: 1.6;
      margin: 0 0 24px;
    }

    :host-context(html.dark-theme) .confirm-title {
      color: #f3f4f6;
    }

    :host-context(html.dark-theme) .confirm-message {
      color: #d1d5db;
    }

    .confirm-actions {
      display: flex;
      gap: 10px;
      width: 100%;
    }

    .btn-cancelar,
    .btn-confirmar {
      flex: 1;
      height: 38px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover { opacity: 0.85; }
    }

    .btn-cancelar {
      background: #f0f0f0;
      color: #555;
      border: 1px solid #ddd;
    }

    .btn-confirmar {
      background: #c62828;
      color: #fff;
    }
  `],
})
export class ConfirmarExclusaoDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmarExclusaoDialogComponent>);
}
