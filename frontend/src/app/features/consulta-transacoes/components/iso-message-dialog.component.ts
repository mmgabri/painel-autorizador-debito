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
    }
    .field-full-width {
      width: 100%;
    }
    .empty-state {
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
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
