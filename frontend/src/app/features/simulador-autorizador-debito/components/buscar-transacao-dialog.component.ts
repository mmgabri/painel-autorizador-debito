import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IsoParserService, TransacaoItem } from '../services/iso-parser.service';

@Component({
  selector: 'app-buscar-transacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Buscar transação</h2>
    <mat-dialog-content>
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field filter-nome">
          <mat-label>Filtrar por Nome Produto</mat-label>
          <input matInput [(ngModel)]="filtro" (keyup.enter)="onFiltrar()" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field filter-tag">
          <mat-label>Filtrar por Tag</mat-label>
          <input matInput [(ngModel)]="filtroTag" maxlength="15" (keyup.enter)="onFiltrar()" />
        </mat-form-field>
        <button mat-raised-button color="primary" class="filtrar-btn" (click)="onFiltrar()">
          Filtrar
        </button>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <div class="transacao-list">
        @for (item of transacoes(); track item.id) {
          <div class="transacao-row">
            <div class="transacao-info">
              <span class="nome">{{ item.nomeProduto }}</span>
              <span class="tag">{{ item.tag }}</span>
              <span class="descricao">{{ item.descricao }}</span>
            </div>
            <button
              mat-icon-button
              color="primary"
              (click)="onSelecionar(item)"
              aria-label="Executar transação"
            >
              <mat-icon>play_circle</mat-icon>
            </button>
          </div>
        } @empty {
          @if (!loading()) {
            <p class="empty-message">Nenhuma transação encontrada</p>
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

    .filter-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-top: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;

      .filter-nome {
        flex: 2;
        min-width: 200px;
      }

      .filter-tag {
        flex: 1;
        min-width: 140px;
      }

      .filtrar-btn {
        margin-top: 8px;
        white-space: nowrap;
      }
    }

    .transacao-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
    }

    .transacao-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);

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
export class BuscarTransacaoDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<BuscarTransacaoDialogComponent>);
  private readonly isoParserService = inject(IsoParserService);

  filtro = '';
  filtroTag = '';
  loading = signal(false);
  transacoes = signal<TransacaoItem[]>([]);

  ngOnInit(): void {
    this.carregarTransacoes();
  }

  onFiltrar(): void {
    this.carregarTransacoes(this.filtro, this.filtroTag);
  }

  onSelecionar(item: TransacaoItem): void {
    this.dialogRef.close(item);
  }

  private carregarTransacoes(nomeProduto?: string, tag?: string): void {
    this.loading.set(true);
    this.isoParserService.consultarTransacoes(nomeProduto, tag).subscribe({
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
}
