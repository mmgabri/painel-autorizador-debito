import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ErrorDialogData {
  code: string;
  description: string;
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-dialog">
      <div class="error-icon-wrap">
        <mat-icon class="error-icon">error_outline</mat-icon>
      </div>
      <h2 class="error-title">Ops! Algo deu errado</h2>

      <div class="error-body">
        <div class="error-field">
          <span class="label">Código</span>
          <span class="code-value">{{ data.code }}</span>
        </div>
        <div class="error-field">
          <span class="label">Descrição</span>
          <p class="desc-value">{{ data.description }}</p>
        </div>
      </div>

      <div class="error-actions">
        <button class="btn-fechar" (click)="close()">Fechar</button>
      </div>
    </div>
  `,
  styles: [`
    .error-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 24px 20px;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }

    .error-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(198, 40, 40, 0.08);
      border: 1px solid rgba(198, 40, 40, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
      flex-shrink: 0;
    }

    .error-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #c62828;
    }

    .error-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--app-text, #1a1a1a);
      margin: 0 0 18px;
    }

    :host-context(html.dark-theme) .error-title {
      color: #f3f4f6;
    }

    .error-body {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
      margin-bottom: 24px;
    }

    .error-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #888;
    }

    :host-context(html.dark-theme) .label {
      color: #9ca3af;
    }

    .code-value {
      font-family: monospace;
      font-size: 13px;
      font-weight: 600;
      background: var(--app-surface-2, #f7f7f7);
      border: 1px solid var(--app-border, #e0e0e0);
      border-radius: 4px;
      padding: 5px 10px;
      display: inline-block;
      width: fit-content;
      color: #c62828;
    }

    :host-context(html.dark-theme) .code-value {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.12);
    }

    .desc-value {
      margin: 0;
      font-size: 13px;
      color: #555;
      line-height: 1.6;
    }

    :host-context(html.dark-theme) .desc-value {
      color: #d1d5db;
    }

    .error-actions {
      width: 100%;
    }

    .btn-fechar {
      width: 100%;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--app-action-btn-border, #ddd);
      background: var(--app-action-btn-bg, #f0f0f0);
      color: var(--app-action-btn-color, #555);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;

      &:hover { opacity: 0.85; }
    }
  `],
})
export class ErrorDialogComponent {
  readonly data = inject<ErrorDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ErrorDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
