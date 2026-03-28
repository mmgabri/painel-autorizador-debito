import { Component, Input, OnInit, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { switchMap, EMPTY } from 'rxjs';
import { IsoParserService, TransacaoItem, SalvarTransacaoRequest } from '../../services/iso-parser.service';

@Component({
  selector: 'app-configurar-cenario',
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
  ],
  templateUrl: './configurar-cenario.component.html',
  styleUrl: './configurar-cenario.component.scss',
})
export class ConfigurarCenarioComponent implements OnInit {
  @Input() cenario: TransacaoItem | null = null;

  readonly salvo = output<TransacaoItem>();
  readonly disparar = output<TransacaoItem>();

  private readonly isoParserService = inject(IsoParserService);
  private readonly notif = inject(NotificationService);

  readonly messageModelOptions = ['SINGLE_MESSAGE', 'DUAL_MESSAGE'];
  readonly messageTypeOptions = ['AUTORIZACAO', 'CONCILIACAO'];
  readonly bandeiraOptions = ['MASTERCARD', 'VISA'];

  incluirForm = new FormGroup({
    nomeProduto: new FormControl('', [Validators.required]),
    tag: new FormControl('', [Validators.required]),
    messageModel: new FormControl('', [Validators.required]),
    messageType: new FormControl('', [Validators.required]),
    bandeira: new FormControl('', [Validators.required]),
    descricao: new FormControl(''),
    isoMessage: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  mti = signal('');
  bitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  sortedKeys = signal<string[]>([]);
  availableBits = signal<number[]>([]);
  loading = signal(false);
  saving = signal(false);
  savedSuccessfully = signal(false);
  canCreateNext = signal(false);

  private editingTransacaoId = signal<string | null>(null);

  isConciliacaoIncluir(): boolean {
    return (this.incluirForm.controls.messageType.value ?? '') === 'CONCILIACAO';
  }

  ngOnInit(): void {
    if (this.cenario) {
      this.editingTransacaoId.set(this.cenario.id);
      this.incluirForm.patchValue({
        nomeProduto: this.cenario.productName,
        tag: this.cenario.tag ?? '',
        messageModel: this.cenario.messageModel ?? '',
        messageType: this.cenario.messageType ?? '',
        bandeira: this.cenario.paymentNetwork ?? '',
        descricao: this.cenario.description,
        isoMessage: this.cenario.message,
      });

      if (this.cenario.message && this.cenario.message.trim().length >= 4) {
        this.loading.set(true);
        this.isoParserService
          .parseIso(this.cenario.message, this.cenario.messageModel, this.cenario.paymentNetwork, this.cenario.messageType)
          .subscribe({
            next: (result) => {
              this.loading.set(false);
              this.mti.set(result.mti ?? '');
              const fieldsWithMti = { ...result.fields };
              if (result.mti) {
                fieldsWithMti['00'] = result.mti;
              }
              this.buildBitsForm(fieldsWithMti);
            },
            error: () => {
              this.loading.set(false);
            },
          });
      }
    } else {
      this.updateAvailableBits();
    }
  }

  onCarregarCampos(): void {
    const message = this.incluirForm.controls.isoMessage.value ?? '';
    if (!message || message.trim().length < 4) {
      this.notif.warn('Informe a mensagem ISO com no mínimo 4 caracteres');
      return;
    }

    const messageModel = this.incluirForm.controls.messageModel.value ?? '';
    const messageType = this.incluirForm.controls.messageType.value ?? '';
    const bandeira = this.incluirForm.controls.bandeira.value ?? '';
    if (!messageModel || !messageType || !bandeira) {
      this.notif.warn('Preencha os campos Message Model, Tipo Mensagem e Bandeira antes de carregar');
      return;
    }

    this.loading.set(true);
    this.isoParserService.parseIso(message, messageModel, bandeira, messageType).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.mti.set(result.mti ?? '');
        const fieldsWithMti = { ...result.fields };
        if (result.mti) {
          fieldsWithMti['00'] = result.mti;
        }
        this.buildBitsForm(fieldsWithMti);
      },
      error: () => {
        this.loading.set(false);
        this.notif.error('Erro ao carregar campos');
      },
    });
  }

  onIncluirCampo(bitNumber: number): void {
    if (this.isConciliacaoIncluir()) return;
    const key = String(bitNumber).padStart(2, '0');
    const currentForm = this.bitsForm();
    const currentKeys = this.sortedKeys();

    if (currentKeys.includes(key)) return;

    const newGroup = new FormGroup<Record<string, FormControl<string>>>({});
    for (const existingKey of currentKeys) {
      newGroup.addControl(existingKey, currentForm.controls[existingKey]);
    }
    newGroup.addControl(key, new FormControl('', { nonNullable: true }));

    this.bitsForm.set(newGroup);
    const allKeys = [...currentKeys, key];
    const sorted = allKeys.filter(k => k !== '00').sort((a, b) => Number(a) - Number(b));
    if (allKeys.includes('00')) sorted.unshift('00');
    this.sortedKeys.set(sorted);
    this.updateAvailableBits();
  }

  onRemoverCampo(key: string): void {
    if (this.isConciliacaoIncluir()) return;
    const currentForm = this.bitsForm();
    const currentKeys = this.sortedKeys();

    const newGroup = new FormGroup<Record<string, FormControl<string>>>({});
    for (const existingKey of currentKeys) {
      if (existingKey !== key) {
        newGroup.addControl(existingKey, currentForm.controls[existingKey]);
      }
    }

    this.bitsForm.set(newGroup);
    this.sortedKeys.set(currentKeys.filter((k) => k !== key));
    this.updateAvailableBits();
  }

  onSalvarTransacao(): void {
    const isNewTransacao = !this.editingTransacaoId();

    const fieldsMap = this.getRequestFieldsMap();
    if (Object.keys(fieldsMap).length === 0) {
      this.notif.warn('Adicione pelo menos um campo ISO');
      return;
    }

    const nomeProduto = this.incluirForm.controls.nomeProduto.value ?? '';
    if (!nomeProduto.trim()) {
      this.notif.warn('Informe o Nome do Produto');
      return;
    }

    const messageModel = this.incluirForm.controls.messageModel.value ?? '';
    const messageType = this.incluirForm.controls.messageType.value ?? '';
    const bandeira = this.incluirForm.controls.bandeira.value ?? '';
    if (!messageModel || !messageType || !bandeira) {
      this.saving.set(false);
      this.notif.warn('Preencha os campos Message Model, Tipo Mensagem e Bandeira antes de salvar');
      return;
    }

    this.saving.set(true);

    const mtiValue = fieldsMap['00'] ?? '';
    const fieldsWithoutMti = { ...fieldsMap };
    delete fieldsWithoutMti['00'];

    this.isoParserService
      .buildIso(mtiValue, fieldsWithoutMti, messageModel, bandeira, messageType)
      .pipe(
        switchMap((buildResult) => {
          this.incluirForm.controls.isoMessage.setValue(buildResult.message);

          const tag = this.incluirForm.controls.tag.value ?? '';
          if (!tag.trim()) {
            this.saving.set(false);
            this.notif.warn('Informe a Tag');
            return EMPTY;
          }

          const payload: SalvarTransacaoRequest = {
            id: this.editingTransacaoId() ?? '',
            productName: nomeProduto.trim(),
            tag: tag.trim(),
            description: (this.incluirForm.controls.descricao.value ?? '').trim(),
            message: buildResult.message,
            messageModel,
            messageType,
            paymentNetwork: bandeira,
          };
          return this.isoParserService.salvarTransacao(payload);
        }),
      )
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          this.editingTransacaoId.set(result.id);
          this.savedSuccessfully.set(true);
          this.canCreateNext.set(isNewTransacao);
          this.notif.success('Transação salva com sucesso');

          const saved: TransacaoItem = {
            id: result.id,
            productName: (this.incluirForm.controls.nomeProduto.value ?? '').trim(),
            tag: (this.incluirForm.controls.tag.value ?? '').trim(),
            description: (this.incluirForm.controls.descricao.value ?? '').trim(),
            message: (this.incluirForm.controls.isoMessage.value ?? '').trim(),
            messageModel,
            messageType,
            paymentNetwork: bandeira,
            criadoEm: this.cenario?.criadoEm ?? new Date().toISOString(),
          };
          this.salvo.emit(saved);
        },
        error: () => {
          this.saving.set(false);
          this.notif.error('Erro ao salvar transação');
        },
      });
  }

  onCriarProximo(): void {
    this.cenario = null;
    this.editingTransacaoId.set(null);
    this.savedSuccessfully.set(false);
    this.canCreateNext.set(false);

    this.incluirForm.reset({
      nomeProduto: '',
      tag: '',
      messageModel: '',
      messageType: '',
      bandeira: '',
      descricao: '',
      isoMessage: '',
    });

    this.mti.set('');
    this.bitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.sortedKeys.set([]);
    this.updateAvailableBits();
  }

  onDispararFromIncluir(): void {
    const id = this.editingTransacaoId();
    if (!id) return;

    const messageModel = this.incluirForm.controls.messageModel.value ?? '';
    const messageType = this.incluirForm.controls.messageType.value ?? '';

    const cenario: TransacaoItem = {
      id,
      productName: (this.incluirForm.controls.nomeProduto.value ?? '').trim(),
      tag: (this.incluirForm.controls.tag.value ?? '').trim(),
      description: (this.incluirForm.controls.descricao.value ?? '').trim(),
      message: (this.incluirForm.controls.isoMessage.value ?? '').trim(),
      messageModel: messageModel.trim(),
      messageType: messageType.trim(),
      paymentNetwork: (this.incluirForm.controls.bandeira.value ?? '').trim(),
      criadoEm: this.cenario?.criadoEm ?? new Date().toISOString(),
    };

    this.disparar.emit(cenario);
  }

  private getRequestFieldsMap(): Record<string, string> {
    const form = this.bitsForm();
    const map: Record<string, string> = {};
    for (const key of this.sortedKeys()) {
      map[key] = form.controls[key]?.value ?? '';
    }
    return map;
  }

  private buildBitsForm(map: Record<string, string>): void {
    const keys = this.moveMtiKeyFirst(Object.keys(map));
    this.sortedKeys.set(keys);

    const group: Record<string, FormControl<string>> = {};
    for (const key of keys) {
      group[key] = new FormControl(map[key], { nonNullable: true });
    }

    this.bitsForm.set(new FormGroup(group));
    this.updateAvailableBits();
  }

  private moveMtiKeyFirst(keys: string[]): string[] {
    const result = [...keys];
    const idx = result.findIndex((k) => {
      const n = k.trim();
      return n === '00' || n === '0';
    });
    if (idx > 0) {
      const [mtiKey] = result.splice(idx, 1);
      result.unshift(mtiKey);
    }
    return result;
  }

  private updateAvailableBits(): void {
    const usedKeys = new Set(this.sortedKeys().map((k) => Number(k)));
    const available: number[] = [];
    for (let i = 0; i <= 128; i++) {
      if (i === 1) continue;
      if (!usedKeys.has(i)) available.push(i);
    }
    this.availableBits.set(available);
  }
}
