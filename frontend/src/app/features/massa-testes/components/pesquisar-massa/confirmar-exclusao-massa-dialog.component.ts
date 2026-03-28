import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmar-exclusao-massa-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon">
        <mat-icon>warning_amber</mat-icon>
      </div>
      <h2 class="confirm-title">Confirmar exclusão</h2>
      <p class="confirm-message">Tem certeza que deseja excluir esta massa de testes? Esta ação não pode ser desfeita.</p>
      <div class="confirm-actions">
        <button mat-button class="cancel-btn" (click)="cancel()">Cancelar</button>
        <button mat-raised-button class="confirm-btn" (click)="confirm()">Excluir</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 24px;
      text-align: center;
      max-width: 320px;
    }
    .confirm-icon {
      width: 52px; height: 52px; border-radius: 50%;
      background: rgba(236, 112, 0, 0.12);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      mat-icon { color: #ec7000; font-size: 28px; width: 28px; height: 28px; }
    }
    .confirm-title {
      font-size: 16px; font-weight: 700; color: #1a1a2e;
      margin: 0 0 10px;
    }
    :host-context(html.dark-theme) .confirm-title { color: #f3f4f6; }
    .confirm-message {
      font-size: 13px; color: #555; line-height: 1.5; margin: 0 0 24px;
    }
    :host-context(html.dark-theme) .confirm-message { color: #d1d5db; }
    .confirm-actions {
      display: flex; gap: 12px; justify-content: center;
    }
    .cancel-btn { color: #666; font-weight: 500; }
    .confirm-btn {
      background-color: #ec7000 !important; color: #fff !important;
      border-radius: 8px !important; font-weight: 600 !important;
      box-shadow: none !important;
    }
  `],
})
export class ConfirmarExclusaoMassaDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<ConfirmarExclusaoMassaDialogComponent>) {}
  cancel(): void { this.dialogRef.close(false); }
  confirm(): void { this.dialogRef.close(true); }
}
