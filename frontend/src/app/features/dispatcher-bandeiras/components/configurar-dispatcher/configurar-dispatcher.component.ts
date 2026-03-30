import { Component, Input, OnInit, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { DispatcherService, DispatcherEventoItem, SalvarDispatcherEventoRequest } from '../../services/dispatcher.service';
import { JsonViewerDialogComponent } from '../json-viewer-dialog/json-viewer-dialog.component';

@Component({
  selector: 'app-configurar-dispatcher',
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
    MatSelectModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './configurar-dispatcher.component.html',
  styleUrl: './configurar-dispatcher.component.scss',
})
export class ConfigurarDispatcherComponent implements OnInit {
  @Input() evento: DispatcherEventoItem | null = null;

  readonly salvo = output<DispatcherEventoItem>();
  readonly disparar = output<DispatcherEventoItem>();

  private readonly dispatcherService = inject(DispatcherService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly messageModelOptions = ['SINGLE_MESSAGE', 'DUAL_MESSAGE'];
  readonly messageTypeOptions = ['AUTORIZACAO', 'CONCILIACAO'];
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

  form = new FormGroup({
    nomeProduto: new FormControl('', [Validators.required]),
    targetMicroservice: new FormControl('', [Validators.required]),
    tag: new FormControl('', [Validators.required]),
    messageModel: new FormControl('', [Validators.required]),
    messageType: new FormControl('', [Validators.required]),
    bandeira: new FormControl('', [Validators.required]),
    descricao: new FormControl(''),
    eventoMessage: new FormControl('', [Validators.required]),
  });

  saving = signal(false);
  savedSuccessfully = signal(false);
  canCreateNext = signal(false);
  private editingEventoId = signal<string | null>(null);

  ngOnInit(): void {
    if (this.evento) {
      this.editingEventoId.set(this.evento.id);
      this.form.patchValue({
        nomeProduto: this.evento.productName,
        targetMicroservice: this.evento.targetMicroservice ?? '',
        tag: this.evento.tag ?? '',
        messageModel: this.evento.messageModel ?? '',
        messageType: this.evento.messageType ?? '',
        bandeira: this.evento.paymentNetwork ?? '',
        descricao: this.evento.description,
        eventoMessage: this.evento.message,
      });
      this.savedSuccessfully.set(true);
    }
  }

  onAbrirJsonViewer(): void {
    const current = this.form.controls.eventoMessage.value ?? '';
    const ref = this.dialog.open(JsonViewerDialogComponent, {
      width: '86vw',
      maxWidth: '620px',
      panelClass: 'itau-dialog-panel',
      data: { value: current },
    });

    ref.afterClosed().subscribe((result: string | undefined) => {
      if (result !== undefined) {
        this.form.controls.eventoMessage.setValue(result);
      }
    });
  }

  onBandeiraChange(value: string): void {
    if (value === 'VISA' && this.form.controls.messageModel.value !== 'DUAL_MESSAGE') {
      this.form.controls.messageModel.setValue('DUAL_MESSAGE');
    }
  }

  onSalvar(): void {
    const isNewEvento = !this.editingEventoId();

    const nomeProduto = this.form.controls.nomeProduto.value ?? '';
    if (!nomeProduto.trim()) {
      this.notif.warn('Informe o Nome do Produto');
      return;
    }

    const targetMicroservice = this.form.controls.targetMicroservice.value ?? '';
    if (!targetMicroservice.trim()) {
      this.notif.warn('Selecione o Micro-serviço Alvo');
      return;
    }

    const tag = this.form.controls.tag.value ?? '';
    if (!tag.trim()) {
      this.notif.warn('Informe a Tag');
      return;
    }

    const eventoMessage = this.form.controls.eventoMessage.value ?? '';
    if (!eventoMessage.trim()) {
      this.notif.warn('Informe o Evento');
      return;
    }

    const messageModel = this.form.controls.messageModel.value ?? '';
    const messageType = this.form.controls.messageType.value ?? '';
    const bandeira = this.form.controls.bandeira.value ?? '';
    if (!messageModel || !messageType || !bandeira) {
      this.notif.warn('Preencha os campos Message Model, Tipo Mensagem e Bandeira antes de salvar');
      return;
    }

    this.saving.set(true);

    const payload: SalvarDispatcherEventoRequest = {
      id: this.editingEventoId() ?? undefined,
      productName: nomeProduto.trim(),
      targetMicroservice: targetMicroservice.trim(),
      tag: tag.trim(),
      description: (this.form.controls.descricao.value ?? '').trim(),
      message: eventoMessage.trim(),
      messageModel,
      messageType,
      paymentNetwork: bandeira,
    };

    this.dispatcherService.salvarEvento(payload).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.editingEventoId.set(result.id);
        this.savedSuccessfully.set(true);
        this.canCreateNext.set(isNewEvento);
        this.notif.success('Evento salvo com sucesso');

        const saved: DispatcherEventoItem = {
          id: result.id,
          productName: nomeProduto.trim(),
          targetMicroservice: targetMicroservice.trim(),
          tag: tag.trim(),
          description: (this.form.controls.descricao.value ?? '').trim(),
          message: eventoMessage.trim(),
          messageModel,
          messageType,
          paymentNetwork: bandeira,
          updatedAt: result.updatedAt ?? new Date().toISOString(),
        };
        this.salvo.emit(saved);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  onCriarProximo(): void {
    this.evento = null;
    this.editingEventoId.set(null);
    this.savedSuccessfully.set(false);
    this.canCreateNext.set(false);

    this.form.reset({
      nomeProduto: '',
      targetMicroservice: '',
      tag: '',
      messageModel: '',
      messageType: '',
      bandeira: '',
      descricao: '',
      eventoMessage: '',
    });
  }

  onDisparar(): void {
    const id = this.editingEventoId();
    if (!id) return;

    const evento: DispatcherEventoItem = {
      id,
      productName: (this.form.controls.nomeProduto.value ?? '').trim(),
      targetMicroservice: (this.form.controls.targetMicroservice.value ?? '').trim(),
      tag: (this.form.controls.tag.value ?? '').trim(),
      description: (this.form.controls.descricao.value ?? '').trim(),
      message: (this.form.controls.eventoMessage.value ?? '').trim(),
      messageModel: (this.form.controls.messageModel.value ?? '').trim(),
      messageType: (this.form.controls.messageType.value ?? '').trim(),
      paymentNetwork: (this.form.controls.bandeira.value ?? '').trim(),
      updatedAt: this.evento?.updatedAt ?? new Date().toISOString(),
    };

    this.disparar.emit(evento);
  }
}
