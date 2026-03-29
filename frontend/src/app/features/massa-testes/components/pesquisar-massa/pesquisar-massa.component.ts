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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { MassaTestesService, MassaTestesItem } from '../../services/massa-testes.service';
import { ConfirmarExclusaoMassaDialogComponent } from './confirmar-exclusao-massa-dialog.component';
import { VisualizarMassaDialogComponent } from './visualizar-massa-dialog.component';

const BANDEIRA_LOGOS: Record<string, string> = {
  VISA: 'logo-visa.png',
  MASTERCARD: 'logo-mastercard.png',
};

@Component({
  selector: 'app-pesquisar-massa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, MatTooltipModule,
  ],
  templateUrl: './pesquisar-massa.component.html',
  styleUrl: './pesquisar-massa.component.scss',
})
export class PesquisarMassaComponent implements OnInit {
  private readonly massaTestesService = inject(MassaTestesService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly editou = output<MassaTestesItem>();
  readonly criarMassa = output<void>();

  filtroCartao = '';
  filtroIdConta = '';
  filtroBandeira = '';
  filtroModeloMensagem = '';
  filtroTag = '';

  loading = signal(false);
  massas = signal<MassaTestesItem[]>([]);

  readonly displayedColumns = ['cardNumber', 'accountId', 'agency', 'account', 'dac', 'paymentNetwork', 'messageModel', 'tag', 'acoes'];
  readonly bandeiraOptions = ['MASTERCARD', 'VISA'];
  readonly modeloMensagemOptions = ['SINGLE_MESSAGE', 'DUAL_MESSAGE'];

  ngOnInit(): void { this.carregar(); }

  getBandeiraLogo(bandeira: string): string { return BANDEIRA_LOGOS[bandeira?.toUpperCase()] ?? ''; }

  onLogoError(event: Event, bandeira: string): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const span = document.createElement('span');
    span.className = 'badge bandeira-badge';
    span.textContent = bandeira;
    img.parentNode?.replaceChild(span, img);
  }

  onFiltrar(): void { this.carregar(); }

  onCriar(): void { this.criarMassa.emit(); }

  onEditar(item: MassaTestesItem): void { this.editou.emit(item); }

  onVisualizar(item: MassaTestesItem): void {
    this.dialog.open(VisualizarMassaDialogComponent, {
      width: '620px',
      maxWidth: '96vw',
      maxHeight: '90vh',
      panelClass: 'itau-dialog-panel',
      data: item,
    });
  }

  onCarregarDadinho(item: MassaTestesItem): void {
    this.massaTestesService.carregarDadinho(item.id).subscribe({
      next: () => { this.notif.success('Dadinho carregado com sucesso'); },
      error: () => {},
    });
  }

  onExcluir(item: MassaTestesItem): void {
    const ref = this.dialog.open(ConfirmarExclusaoMassaDialogComponent, {
      width: '360px', panelClass: 'itau-dialog-panel',
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.massaTestesService.excluir(item.id).subscribe({
        next: () => {
          this.notif.success('Massa de testes excluída com sucesso');
          this.massas.set(this.massas().filter((m) => m.id !== item.id));
        },
        error: () => {},
      });
    });
  }

  carregar(): void {
    this.loading.set(true);
    this.massaTestesService.consultar({
      cardNumber: this.filtroCartao || undefined,
      accountId: this.filtroIdConta || undefined,
      paymentNetwork: this.filtroBandeira || undefined,
      messageModel: this.filtroModeloMensagem || undefined,
      tag: this.filtroTag || undefined,
    }).subscribe({
      next: (list) => { this.loading.set(false); this.massas.set(list); },
      error: () => { this.loading.set(false); this.massas.set([]); },
    });
  }
}
