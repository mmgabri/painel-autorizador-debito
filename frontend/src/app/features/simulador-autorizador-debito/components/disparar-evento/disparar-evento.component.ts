import { Component, Input, OnInit, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { DispatcherService, DispatcherEventoItem, DispatcherEventoStage } from '../../services/dispatcher.service';
import { ConfirmarExclusaoDispatcherDialogComponent } from '../buscar-dispatcher/confirmar-exclusao-dispatcher-dialog.component';
import { JsonViewerDialogComponent } from '../json-viewer-dialog/json-viewer-dialog.component';

@Component({
  selector: 'app-disparar-evento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './disparar-evento.component.html',
  styleUrl: './disparar-evento.component.scss',
})
export class DispararEventoComponent implements OnInit {
  @Input({ required: true }) evento!: DispatcherEventoItem;

  readonly voltou = output<void>();
  readonly editou = output<DispatcherEventoItem>();
  readonly excluiu = output<void>();

  private readonly dispatcherService = inject(DispatcherService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  executing = signal(false);
  currentMessage = signal('');

  stages = signal<DispatcherEventoStage[]>([{ duration: 1, tps: 1 }]);

  // Success overlay
  showSuccessOverlay = signal(false);
  countdownSeconds = signal(3);
  private successTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.currentMessage.set(this.evento.message ?? '');
  }

  onAbrirJsonViewer(): void {
    const ref = this.dialog.open(JsonViewerDialogComponent, {
      width: '86vw',
      maxWidth: '620px',
      panelClass: 'itau-dialog-panel',
      data: { value: this.currentMessage() },
    });

    ref.afterClosed().subscribe((result: string | undefined) => {
      if (result !== undefined) {
        this.currentMessage.set(result);
      }
    });
  }

  onAdicionarStage(): void {
    this.stages.set([...this.stages(), { duration: 1, tps: 1 }]);
  }

  onRemoverStage(index: number): void {
    if (this.stages().length <= 1) return;
    const updated = this.stages().filter((_, i) => i !== index);
    this.stages.set(updated);
  }

  onStageDurationChange(index: number, value: number): void {
    const updated = this.stages().map((s, i) => i === index ? { ...s, duration: value } : s);
    this.stages.set(updated);
  }

  onStageTpsChange(index: number, value: number): void {
    const updated = this.stages().map((s, i) => i === index ? { ...s, tps: value } : s);
    this.stages.set(updated);
  }

  onDisparar(): void {
    this.executing.set(true);

    this.dispatcherService.executarEvento({
      id: this.evento.id,
      productName: this.evento.productName,
      targetMicroservice: this.evento.targetMicroservice,
      messageModel: this.evento.messageModel,
      messageType: this.evento.messageType,
      paymentNetwork: this.evento.paymentNetwork,
      tag: this.evento.tag,
      description: this.evento.description,
      message: this.currentMessage(),
      stages: this.stages(),
    }).subscribe({
      next: () => {
        this.executing.set(false);
        this.countdownSeconds.set(3);
        this.showSuccessOverlay.set(true);

        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
          const current = this.countdownSeconds();
          if (current <= 1) {
            this.onFecharSuccessOverlay();
          } else {
            this.countdownSeconds.set(current - 1);
          }
        }, 1000);
      },
      error: () => {
        this.executing.set(false);
        this.notif.error('Erro ao disparar evento');
      },
    });
  }

  onFecharSuccessOverlay(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.showSuccessOverlay.set(false);
  }

  onVoltar(): void {
    this.voltou.emit();
  }

  onEditar(): void {
    this.editou.emit(this.evento);
  }

  onExcluir(): void {
    const ref = this.dialog.open(ConfirmarExclusaoDispatcherDialogComponent, {
      width: '360px',
      panelClass: 'itau-dialog-panel',
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.dispatcherService.excluirEvento(this.evento.id).subscribe({
        next: () => {
          this.notif.success('Evento excluído com sucesso');
          this.excluiu.emit();
        },
        error: () => {
          this.notif.error('Erro ao excluir evento');
        },
      });
    });
  }
}
