import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MassaTestesItem, MassaTestesService } from '../../services/massa-testes.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-visualizar-massa-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="visualizar-dialog">
      <div class="dialog-title">
        <mat-icon>inventory_2</mat-icon>
        <span>Dados da Massa de Testes</span>
      </div>

      <div class="dialog-content">
        <!-- Bloco 1: Dados -->
        <div class="section">
          <div class="section-title">
            <mat-icon>info_outline</mat-icon>
            <span>Dados</span>
          </div>
          <div class="fields-grid">
            <div class="field-row"><span class="field-label">Bandeira</span><span class="field-value">{{ massa.paymentNetwork }}</span></div>
            <div class="field-row"><span class="field-label">Modelo Mensagem</span><span class="field-value">{{ massa.messageModel }}</span></div>
            <div class="field-row"><span class="field-label">Tag</span><span class="field-value tag-badge">{{ massa.tag }}</span></div>
            <div class="field-row"><span class="field-label">Descrição</span><span class="field-value">{{ massa.description || '—' }}</span></div>
          </div>
        </div>

        <!-- Bloco 2: Dados Cartão -->
        <div class="section">
          <div class="section-title">
            <mat-icon>credit_card</mat-icon>
            <span>Dados Cartão</span>
          </div>
          <div class="fields-grid">
            <div class="field-row"><span class="field-label">Cartão</span><span class="field-value field-mono">{{ massa.cardNumber }}</span></div>
            <div class="field-row"><span class="field-label">Data Vencimento</span><span class="field-value">{{ massa.expiryDate }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Funcionalidade</span><span class="field-value">{{ massa.cardFunctionalityCode }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Serviço 1º Dígito</span><span class="field-value">{{ massa.firstDigitServiceCode }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Situação</span><span class="field-value">{{ massa.situationCode }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Status</span><span class="field-value">{{ massa.statusCode }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Tecnologia</span><span class="field-value">{{ massa.technologyCode }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Tipo</span><span class="field-value">{{ massa.typeCode }}</span></div>
          </div>
        </div>

        <!-- Bloco 3: Dados Conta Corrente -->
        <div class="section">
          <div class="section-title">
            <mat-icon>account_balance</mat-icon>
            <span>Dados Conta Corrente</span>
          </div>
          <div class="fields-grid">
            <div class="field-row"><span class="field-label">ID Conta</span><span class="field-value field-mono">{{ massa.accountId }}</span></div>
            <div class="field-row"><span class="field-label">Agência</span><span class="field-value">{{ massa.agency || '—' }}</span></div>
            <div class="field-row"><span class="field-label">Conta</span><span class="field-value">{{ massa.account || '—' }}</span></div>
            <div class="field-row"><span class="field-label">DAC</span><span class="field-value">{{ massa.dac || '—' }}</span></div>
            <div class="field-row"><span class="field-label">Sufixo</span><span class="field-value">{{ massa.suffix }}</span></div>
            <div class="field-row"><span class="field-label">Tipo Conta</span><span class="field-value">{{ massa.accountType }}</span></div>
            <div class="field-row"><span class="field-label">Titular</span><span class="field-value">{{ massa.accountHolder }}</span></div>
            <div class="field-row"><span class="field-label">ID Categoria</span><span class="field-value">{{ massa.categoryId }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Segmento</span><span class="field-value">{{ massa.segmentCode }}</span></div>
            <div class="field-row"><span class="field-label">Cód. Tipo Pessoa</span><span class="field-value">{{ massa.personTypeCode }}</span></div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn-fechar" (click)="fechar()">Fechar</button>
        <button class="btn-dadinho" [disabled]="carregando()" (click)="carregarDadinho()">
          <mat-icon>bolt</mat-icon>
          Carregar Dadinho
        </button>
      </div>
    </div>
  `,
  styles: [`
    .visualizar-dialog {
      min-width: 480px; max-width: 600px;
      display: flex; flex-direction: column; max-height: 90vh;
    }

    .dialog-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 15px; font-weight: 700; color: var(--app-text-navy);
      padding: 20px 24px 12px;
      flex-shrink: 0;
      mat-icon { color: #ec7000; font-size: 22px; width: 22px; height: 22px; }
    }
    :host-context(html.dark-theme) .dialog-title { color: #ffffff; }

    .dialog-content { padding: 0 24px 8px; flex: 1; overflow-y: auto; min-height: 0; }

    .section {
      margin-bottom: 16px;
      border: 1px solid var(--app-border-light);
      border-radius: 10px;
      padding: 12px 14px;
      background: var(--app-surface);
    }

    .section-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; color: var(--app-text-navy);
      margin-bottom: 10px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--app-text-navy); }
    }

    .fields-grid { display: flex; flex-direction: column; gap: 6px; }

    .field-row {
      display: flex; align-items: baseline; gap: 8px;
      font-size: 13px;
    }
    .field-label {
      min-width: 170px; font-weight: 500;
      color: var(--app-text-secondary); font-size: 12px; flex-shrink: 0;
    }
    .field-value { color: var(--app-text); word-break: break-all; }
    .field-mono { font-family: monospace; font-size: 12px; }

    .tag-badge {
      display: inline-block; font-size: 11px;
      background: var(--app-tag-bg); color: var(--app-tag-color);
      padding: 1px 8px; border-radius: 12px;
    }

    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 12px 24px 20px;
      border-top: 1px solid var(--app-border-light);
      flex-shrink: 0;
    }

    .btn-fechar,
    .btn-dadinho {
      height: 38px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 0 20px;
      transition: opacity 0.15s;
      display: inline-flex; align-items: center; gap: 6px;
      &:hover:not([disabled]) { opacity: 0.85; }
    }

    .btn-fechar {
      background: var(--app-action-btn-bg);
      color: var(--app-action-btn-color);
      border: 1px solid var(--app-action-btn-border);
    }

    .btn-dadinho {
      background: #ec7000;
      color: #fff;
      &:disabled { background: #ccc; cursor: default; }
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    :host-context(html.dark-theme) .btn-dadinho { background: var(--app-btn-primary-bg); }
    :host-context(html.dark-theme) .btn-dadinho:disabled { background: #3a4455; color: rgba(255,255,255,0.38); }
  `],
})
export class VisualizarMassaDialogComponent {
  readonly massa: MassaTestesItem = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VisualizarMassaDialogComponent>);
  private readonly massaTestesService = inject(MassaTestesService);
  private readonly notif = inject(NotificationService);

  carregando = signal(false);

  fechar(): void { this.dialogRef.close(); }

  carregarDadinho(): void {
    this.carregando.set(true);
    this.massaTestesService.carregarDadinho(this.massa.id).subscribe({
      next: () => {
        this.carregando.set(false);
        this.notif.success('Dadinho carregado com sucesso');
      },
      error: () => {
        this.carregando.set(false);
      },
    });
  }
}
