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
import { DispatcherService, DispatcherEventoItem } from '../../services/dispatcher.service';
import { ConfirmarExclusaoDispatcherDialogComponent } from './confirmar-exclusao-dispatcher-dialog.component';

@Component({
  selector: 'app-buscar-dispatcher',
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
  templateUrl: './buscar-dispatcher.component.html',
  styleUrl: './buscar-dispatcher.component.scss',
})
export class BuscarDispatcherComponent implements OnInit {
  private readonly dispatcherService = inject(DispatcherService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly selecionou = output<DispatcherEventoItem>();
  readonly editou = output<DispatcherEventoItem>();
  readonly criarEvento = output<void>();

  filtroNome = '';
  filtroMicroservico = '';
  filtroTag = '';
  filtroBandeira = '';
  loading = signal(false);
  eventos = signal<DispatcherEventoItem[]>([]);

  readonly displayedColumns = ['productName', 'targetMicroservice', 'paymentNetwork', 'messageModel', 'messageType', 'tag', 'acoes'];
  readonly bandeiraOptions = ['MASTERCARD', 'VISA'];
  readonly microserviceOptions = [
    'acl-autenticacao',
    'acl-seguranca',
    'autorizador-digitais',
    'autorizador-presente',
    'conciliacao-debito',
    'formatador',
    'formatador-contabil',
    'lancamento-conta',
    'limite-bandeiras',
    'limite-portador',
    'restricao-bandeiras',
  ];

  ngOnInit(): void {
    this.carregar();
  }

  onFiltrar(): void {
    this.carregar();
  }

  onSelecionar(item: DispatcherEventoItem): void {
    this.selecionou.emit(item);
  }

  onEditar(item: DispatcherEventoItem): void {
    this.editou.emit(item);
  }

  onExcluir(item: DispatcherEventoItem): void {
    const ref = this.dialog.open(ConfirmarExclusaoDispatcherDialogComponent, {
      width: '360px',
      panelClass: 'itau-dialog-panel',
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.dispatcherService.excluirEvento(item.id).subscribe({
        next: () => {
          this.notif.success('Evento excluído com sucesso');
          this.eventos.set(this.eventos().filter((e) => e.id !== item.id));
        },
        error: () => {
          this.notif.error('Erro ao excluir evento');
        },
      });
    });
  }

  carregar(): void {
    this.loading.set(true);
    this.dispatcherService.consultarEventos({
      productName: this.filtroNome || undefined,
      targetMicroservice: this.filtroMicroservico || undefined,
      tag: this.filtroTag || undefined,
      paymentNetwork: this.filtroBandeira || undefined,
    }).subscribe({
      next: (list) => {
        this.loading.set(false);
        this.eventos.set(list);
      },
      error: () => {
        this.loading.set(false);
        this.eventos.set([]);
      },
    });
  }
}
