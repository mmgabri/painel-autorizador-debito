import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface IsoMessageDialogData {
  title: string; // "Message ISO Request" or "Message ISO Response"
  fields: Record<string, string>;
  loading?: boolean;
  rawMessage?: string; // full hex ISO message
}

@Component({
  selector: 'app-iso-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      @if (data.loading) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      } @else if (sortedKeys.length === 0) {
        <p class="empty-state">Nenhum campo encontrado</p>
      } @else {
        <div class="fields-container">
          @if (data.rawMessage) {
            <mat-form-field appearance="outline" class="field-full-width">
              <mat-label>Mensagem ISO 8583 (hex)</mat-label>
              <textarea matInput [value]="data.rawMessage" readonly rows="3" class="iso-textarea"></textarea>
            </mat-form-field>
          }
          @for (key of sortedKeys; track key) {
            <mat-form-field appearance="outline" class="field-full-width">
              <mat-label>Bit {{ key }}</mat-label>
              <input matInput [value]="data.fields[key]" readonly />
            </mat-form-field>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .fields-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 400px;
      max-height: 400px;
      overflow-y: auto;
      padding-top: 8px;
    }
    .iso-textarea {
      word-break: break-all;
      font-size: 12px;
    }
    .field-full-width {
      width: 100%;
    }
    .empty-state {
      text-align: center;
      color: #a8b0bf;
      padding: 16px;
    }
  `],
})
export class IsoMessageDialogComponent {
  readonly data = inject<IsoMessageDialogData>(MAT_DIALOG_DATA);

  get sortedKeys(): string[] {
    if (!this.data.fields) return [];
    return Object.keys(this.data.fields).sort((a, b) => Number(a) - Number(b));
  }
}
