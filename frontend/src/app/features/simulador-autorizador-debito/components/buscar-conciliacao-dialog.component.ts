import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IsoParserService, TransacaoItem } from '../services/iso-parser.service';
import { BuscarDialogFiltro } from './buscar-estorno-dialog.component';

@Component({
  selector: 'app-buscar-conciliacao-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <!-- Header -->
    <div class="dialog-header">
      <div class="header-icon-wrap">
        <mat-icon class="header-icon">compare_arrows</mat-icon>
      </div>
      <div class="header-text">
        <span class="header-title">Cenário de Conciliação</span>
        <span class="header-sub">Selecione o produto para conciliação</span>
      </div>
      <button mat-icon-button class="header-close" (click)="dialogRef.close()" aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
        <mat-icon matPrefix class="search-icon">search</mat-icon>
        <input matInput placeholder="Buscar por nome ou tag…" [(ngModel)]="filtro" />
        @if (filtro) {
          <button matSuffix mat-icon-button (click)="filtro = ''" aria-label="Limpar">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
    </div>

    <!-- Content -->
    <mat-dialog-content class="dialog-content">
      @if (loading()) {
        <div class="loading-wrap">
          <mat-spinner diameter="36" strokeWidth="3"></mat-spinner>
          <span class="loading-text">Carregando cenários…</span>
        </div>
      } @else {
        @let filtered = filteredList();
        @if (filtered.length > 0) {
          <div class="item-list">
            @for (item of filtered; track item.id) {
              <div class="item-card" (click)="onSelecionar(item)">
                <div class="item-accent"></div>
                <div class="item-body">
                  <div class="item-row-top">
                    <span class="item-nome">{{ item.productName }}</span>
                    <span class="item-bandeira">{{ item.paymentNetwork }}</span>
                  </div>
                  <div class="item-row-mid">
                    <span class="item-badge">{{ item.tag }}</span>
                    <span class="item-badge item-badge-model">{{ item.messageModel }}</span>
                  </div>
                  @if (item.description) {
                    <span class="item-descricao">{{ item.description }}</span>
                  }
                </div>
                <mat-icon class="item-arrow">chevron_right</mat-icon>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <span class="empty-title">Nenhum cenário encontrado</span>
            <span class="empty-sub">Não há cenários de conciliação cadastrados</span>
          </div>
        }
      }
    </mat-dialog-content>

    <!-- Footer -->
    <mat-dialog-actions class="dialog-footer">
      <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; }

    /* ── Header ── */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #003159;
      color: #fff;
      padding: 16px 20px;
      border-radius: 4px 4px 0 0;
      min-width: 0;
    }
    .header-icon-wrap {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .header-icon { font-size: 22px; width: 22px; height: 22px; color: #fff; }
    .header-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .header-title { font-size: 15px; font-weight: 600; letter-spacing: .2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header-sub   { font-size: 12px; opacity: .75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header-close { color: rgba(255,255,255,.8) !important; margin-left: auto; }
    .header-close:hover { color: #fff !important; }

    /* ── Search ── */
    .search-wrap {
      padding: 12px 20px 4px;
      background: #1a2030;
      border-bottom: 1px solid #262c36;
    }
    .search-field { width: 100%; font-size: 13px; }
    .search-icon  { color: #6a7080; font-size: 18px; }

    /* ── Content ── */
    .dialog-content {
      padding: 12px 20px 4px !important;
      max-height: 340px;
      overflow-y: auto;
    }

    .loading-wrap {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 32px 0;
    }
    .loading-text { font-size: 13px; color: #a8b0bf; }

    /* ── Item cards ── */
    .item-list { display: flex; flex-direction: column; gap: 8px; }

    .item-card {
      display: flex; align-items: center;
      border: 1px solid #262c36;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow .15s, border-color .15s;
      background: #161b22;
    }
    .item-card:hover {
      border-color: #ec7000;
      box-shadow: 0 2px 10px rgba(236,112,0,.2);
    }

    .item-accent {
      width: 4px; align-self: stretch; flex-shrink: 0;
      background: #ec7000;
    }

    .item-body {
      flex: 1; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 4px;
    }

    .item-row-top {
      display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
    }
    .item-nome {
      font-size: 13px; font-weight: 600; color: #e7eaf0;
    }
    .item-bandeira {
      font-size: 11px; font-weight: 600; color: #60a5fa;
      background: rgba(0,51,102,.2); border-radius: 4px; padding: 1px 6px;
    }

    .item-row-mid { display: flex; gap: 6px; flex-wrap: wrap; }
    .item-badge {
      font-size: 11px; color: #a8b0bf;
      background: #262c36; border-radius: 4px; padding: 1px 7px;
    }
    .item-badge-model { color: #ec7000; background: rgba(236,112,0,.12); }

    .item-descricao {
      font-size: 11px; color: #6a7080; font-style: italic;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .item-arrow { color: #6a7080; font-size: 20px; margin-right: 8px; flex-shrink: 0; }
    .item-card:hover .item-arrow { color: #ec7000; }

    /* ── Empty ── */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 40px 0;
    }
    .empty-icon  { font-size: 48px; width: 48px; height: 48px; color: #3a4050; }
    .empty-title { font-size: 14px; font-weight: 500; color: #a8b0bf; }
    .empty-sub   { font-size: 12px; color: #6a7080; }

    /* ── Footer ── */
    .dialog-footer {
      padding: 10px 20px !important;
      border-top: 1px solid #262c36;
      justify-content: flex-end !important;
    }
  `],
})
export class BuscarConciliacaoDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<BuscarConciliacaoDialogComponent>);
  private readonly isoParserService = inject(IsoParserService);
  private readonly filtroOrigem = inject<BuscarDialogFiltro>(MAT_DIALOG_DATA, { optional: true });

  loading = signal(false);
  transacoes = signal<TransacaoItem[]>([]);
  filtro = '';

  filteredList(): TransacaoItem[] {
    const q = this.filtro.trim().toLowerCase();
    return this.transacoes().filter(
      (t) =>
        (!q ||
          t.productName.toLowerCase().includes(q) ||
          (t.tag ?? '').toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)),
    );
  }

  ngOnInit(): void {
    this.loading.set(true);
    const paymentNetwork = this.filtroOrigem?.paymentNetwork;
    this.isoParserService.consultarTransacoes('CONCILIACAO', undefined, paymentNetwork).subscribe({
      next: (list) => {
        this.loading.set(false);
        const messageModel = this.filtroOrigem?.messageModel;
        this.transacoes.set(messageModel ? list.filter((t) => t.messageModel === messageModel) : list);
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
