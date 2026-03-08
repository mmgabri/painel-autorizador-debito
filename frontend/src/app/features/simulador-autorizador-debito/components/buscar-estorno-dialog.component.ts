import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IsoParserService, TransacaoItem } from '../services/iso-parser.service';

@Component({
  selector: 'app-buscar-estorno-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Selecione um cenário de estorno</h2>
    <mat-dialog-content>
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <div class="transacao-list">
        @for (item of transacoes(); track item.id) {
          <div class="transacao-row" (click)="onSelecionar(item)">
            <div class="transacao-info">
              <span class="nome">{{ item.nomeProduto }}</span>
              <span class="tag">{{ item.tag }}</span>
              <span class="descricao">{{ item.descricao }}</span>
            </div>
            <button
              mat-icon-button
              color="primary"
              aria-label="Selecionar modelo"
            >
              <mat-icon>save_alt</mat-icon>
            </button>
          </div>
        } @empty {
          @if (!loading()) {
            <p class="empty-message">Nenhum modelo de desfazimento encontrado</p>
          }
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    .transacao-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      margin-top: 8px;
    }

    .transacao-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }

    .transacao-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .nome {
        font-weight: 500;
      }

      .tag {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
      }

      .descricao {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
        font-style: italic;
      }
    }

    .empty-message {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.54);
    }
  `],
})
export class BuscarEstornoDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<BuscarEstornoDialogComponent>);
  private readonly isoParserService = inject(IsoParserService);

  loading = signal(false);
  transacoes = signal<TransacaoItem[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.isoParserService.consultarTransacoes('ESTORNO').subscribe({
      next: (list) => {
        this.loading.set(false);
        this.transacoes.set(list);
      },
      error: () => {
        this.loading.set(false);
        this.transacoes.set([]);
      },
    });
  }

  onSelecionar(item: TransacaoItem): void {
    this.dialogRef.close(item);
  }
}
