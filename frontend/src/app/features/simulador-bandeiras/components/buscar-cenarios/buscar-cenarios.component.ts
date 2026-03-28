import { Component, signal, inject, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { IsoParserService, TransacaoItem } from '../../services/iso-parser.service';
import { ConfirmarExclusaoDialogComponent } from './confirmar-exclusao-dialog.component';

const BANDEIRA_LOGOS: Record<string, string> = {
  VISA:       'logo-visa.png',
  MASTERCARD: 'logo-mastercard.png',
};

@Component({
  selector: 'app-buscar-cenarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  templateUrl: './buscar-cenarios.component.html',
  styleUrl: './buscar-cenarios.component.scss',
})
export class BuscarCenariosComponent implements OnInit {
  private readonly isoParserService = inject(IsoParserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly selecionou = output<TransacaoItem>();
  readonly editou = output<TransacaoItem>();
  readonly criarCenario = output<void>();

  filtroNome = '';
  filtroTag = '';
  filtroBandeira = '';
  filtroTipoMensagem = '';
  loading = signal(false);
  transacoes = signal<TransacaoItem[]>([]);

  readonly displayedColumns = ['productName', 'paymentNetwork', 'messageModel', 'messageType', 'tag', 'acoes'];
  readonly bandeiraOptions = ['MASTERCARD', 'VISA'];
  readonly tipoMensagemOptions = ['AUTORIZACAO', 'CONCILIACAO'];

  ngOnInit(): void {
    this.carregar();
  }

  getBandeiraLogo(paymentNetwork: string): string {
    return BANDEIRA_LOGOS[paymentNetwork?.toUpperCase()] ?? '';
  }

  onLogoError(event: Event, paymentNetwork: string): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const span = document.createElement('span');
    span.className = 'badge bandeira-badge';
    span.textContent = paymentNetwork;
    img.parentNode?.replaceChild(span, img);
  }

  onFiltrar(): void {
    this.carregar(this.filtroNome, this.filtroTag, this.filtroBandeira, this.filtroTipoMensagem);
  }

  onSelecionar(item: TransacaoItem): void {
    this.selecionou.emit(item);
  }

  onEditar(item: TransacaoItem): void {
    this.editou.emit(item);
  }

  onExcluir(item: TransacaoItem): void {
    const ref = this.dialog.open(ConfirmarExclusaoDialogComponent, {
      width: '360px',
      panelClass: 'itau-dialog-panel',
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.isoParserService.excluirTransacao(item.id).subscribe({
        next: (result) => {
          this.notif.success(result?.message ?? 'Cenário excluído com sucesso');
          this.transacoes.set(this.transacoes().filter((t) => t.id !== item.id));
        },
        error: () => {
          this.notif.error('Erro ao excluir cenário');
        },
      });
    });
  }

  carregar(nomeProduto?: string, tag?: string, bandeira?: string, tipoMensagem?: string): void {
    this.loading.set(true);
    this.isoParserService.consultarTransacoes(nomeProduto, tag, bandeira, tipoMensagem).subscribe({
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
