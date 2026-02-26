import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IsoMessageDialogComponent, IsoMessageDialogData } from './iso-message-dialog.component';
import { ConsultaService } from '../services/consulta.service';

export interface DetalhesTransacaoDialogData {
  detalhes: Record<string, string>;
}

@Component({
  selector: 'app-detalhes-transacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>Detalhes transacao</h2>
    <mat-dialog-content>
      <div class="fields-container">
        @for (key of displayKeys; track key) {
          <div class="field-row">
            <mat-form-field appearance="outline" class="field-full-width">
              <mat-label>{{ key }}</mat-label>
              <input matInput [value]="data.detalhes[key]" readonly />
            </mat-form-field>
            @if (key === 'Message ISO Request' || key === 'Message ISO Response') {
              <button mat-icon-button
                      color="primary"
                      (click)="onParseIso(key, data.detalhes[key])"
                      matTooltip="Visualizar campos ISO">
                <mat-icon>visibility</mat-icon>
              </button>
            }
          </div>
        }
      </div>
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
      min-width: 450px;
      max-height: 500px;
      overflow-y: auto;
    }
    .field-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .field-full-width {
      flex: 1;
    }
  `],
})
export class DetalhesTransacaoDialogComponent {
  readonly data = inject<DetalhesTransacaoDialogData>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  private readonly consultaService = inject(ConsultaService);

  get displayKeys(): string[] {
    if (!this.data.detalhes) return [];
    return Object.keys(this.data.detalhes);
  }

  onParseIso(label: string, hexMessage: string): void {
    const title = label;

    // Parse first, then open dialog with results
    this.consultaService.parseIso(hexMessage).subscribe({
      next: (fields) => {
        this.dialog.open(IsoMessageDialogComponent, {
          width: '500px',
          data: { title, fields, loading: false } as IsoMessageDialogData,
        });
      },
      error: () => {
        this.dialog.open(IsoMessageDialogComponent, {
          width: '500px',
          data: { title, fields: {}, loading: false } as IsoMessageDialogData,
        });
      },
    });
  }
}
