import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, EMPTY, delay, of, tap, Observable } from 'rxjs';
import { IsoParserService, TransacaoItem } from '../services/iso-parser.service';
import { BuscarEstornoDialogComponent } from '../components/buscar-estorno-dialog.component';

@Component({
  selector: 'app-simulador-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './simulador-page.component.html',
  styleUrl: './simulador-page.component.scss',
})
export class SimuladorPageComponent {
  // Active view: 'incluir' | 'buscar' | 'disparar'
  activeView = signal<'incluir' | 'buscar' | 'disparar'>('buscar');

  // ─── Incluir transacao ───
  incluirForm = new FormGroup({
    nomeProduto: new FormControl('', [Validators.required]),
    tag: new FormControl('', [Validators.required]),
    messageModel: new FormControl('', [Validators.required]),
    messageType: new FormControl('', [Validators.required]),
    bandeira: new FormControl('', [Validators.required]),
    descricao: new FormControl(''),
    isoMessage: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  messageModelOptions = ['SINGLE_MESSAGE', 'DUAL_MESSAGE'];
  messageTypeOptions = ['AUTORIZACAO', 'CONCILIACAO'];
  bandeiraOptions = ['MASTERCARD', 'VISA'];

  // Request fields (shared between incluir and disparar views)
  mti = signal('');
  bitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  sortedKeys = signal<string[]>([]);
  loading = signal(false);

  // Save state
  saving = signal(false);
  editingTransacaoId = signal<string | null>(null);
  savedSuccessfully = signal(false);

  // Available bits for "Incluir campo" (2-128, excluding already added)
  availableBits = signal<number[]>([]);

  // ─── Buscar / Disparar transacao ───
  buscarFiltro = '';
  buscarFiltroTag = '';
  buscarFiltroBandeira = '';
  buscarLoading = signal(false);
  buscarTransacoes = signal<TransacaoItem[]>([]);

  selectedTransacao = signal<TransacaoItem | null>(null);
  executing = signal(false);

  // Response fields
  responseFields = signal<Record<string, string>>({});
  responseSortedKeys = signal<string[]>([]);
  responseMessage = signal('');
  showResponse = signal(false);

  // Success overlay (Mercado Livre style)
  showSuccessOverlay = signal(false);
  countdownSeconds = signal(5);
  private successTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  // Estorno
  estornarChecked = signal(false);
  conciliarChecked = signal(false);
  estornoTransacao = signal<TransacaoItem | null>(null);
  estornoDelay = signal(5);
  estornoBit90 = signal('');
  estornoMti = signal('');
  estornoSortedKeys = signal<string[]>([]);
  estornoBitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  estornoIsoMessage = signal('');
  estornoLoading = signal(false);
  successMessageText = signal('A transação foi disparada com sucesso. Verificar logs');

  // Interim overlay ("aguardando estorno")
  showInterimOverlay = signal(false);
  interimCountdownSeconds = signal(5);
  interimMessageText = signal('');
  private interimTimer: ReturnType<typeof setTimeout> | null = null;
  private interimCountdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly isoParserService: IsoParserService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {
    // Load transactions on init since default view is 'buscar'
    this.carregarTransacoesBusca();
  }

  // ─── Main view actions ───

  onIncluirTransacao(): void {
    this.activeView.set('incluir');
    this.incluirForm.reset();
    this.resetBitsForm();
    this.editingTransacaoId.set(null);
    this.savedSuccessfully.set(false);
  }

  onDispararTransacao(): void {
    this.resetBitsForm();
    this.showResponse.set(false);
    this.selectedTransacao.set(null);
    this.incluirForm.reset();
    this.buscarFiltro = '';
    this.buscarFiltroTag = '';
    this.buscarFiltroBandeira = '';
    this.activeView.set('buscar');
    this.carregarTransacoesBusca();
  }

  // ─── Buscar view actions ───

  onFiltrarBusca(): void {
    this.carregarTransacoesBusca(this.buscarFiltro, this.buscarFiltroTag, this.buscarFiltroBandeira);
  }

  onSelecionarTransacao(item: TransacaoItem): void {
    this.openDispararView(item);
  }

  onEditarFromBusca(item: TransacaoItem): void {
    this.activeView.set('incluir');
    this.showResponse.set(false);
    this.editingTransacaoId.set(item.id);
    this.savedSuccessfully.set(false);

    this.incluirForm.patchValue({
      nomeProduto: item.productName,
      tag: item.tag ?? '',
      messageModel: item.messageModel ?? '',
      messageType: item.messageType ?? '',
      bandeira: item.paymentNetwork ?? '',
      descricao: item.description,
      isoMessage: item.isoMessage,
    });

    if (item.isoMessage && item.isoMessage.trim().length >= 4) {
      this.loading.set(true);
      this.isoParserService.parseIso(item.isoMessage, item.messageModel, item.paymentNetwork, item.messageType).subscribe({
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
  }

  onExcluirFromBusca(item: TransacaoItem): void {
    this.isoParserService.excluirTransacao(item.id).subscribe({
      next: (result) => {
        this.snackBar.open(result?.message ?? 'Cenário excluído com sucesso', 'Fechar', { duration: 5000 });
        this.buscarTransacoes.set(this.buscarTransacoes().filter(t => t.id !== item.id));
      },
      error: () => {
        this.snackBar.open('Erro ao excluir cenário', 'Fechar', { duration: 5000 });
      },
    });
  }

  onVoltarMain(): void {
    this.activeView.set('buscar');
    this.showResponse.set(false);
    this.selectedTransacao.set(null);
    this.carregarTransacoesBusca(this.buscarFiltro, this.buscarFiltroTag, this.buscarFiltroBandeira);
  }

  // ─── Incluir view actions ───

  onCarregarCampos(): void {
    const message = this.incluirForm.controls.isoMessage.value ?? '';
    if (!message || message.trim().length < 4) {
      this.snackBar.open('Informe a mensagem ISO com no mínimo 4 caracteres', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const messageModel = this.incluirForm.controls.messageModel.value ?? '';
    const messageType = this.incluirForm.controls.messageType.value ?? '';
    const bandeira = this.incluirForm.controls.bandeira.value ?? '';
    if (!messageModel || !messageType || !bandeira) {
      this.snackBar.open('Preencha os campos Message Model, Tipo Mensagem e Bandeira antes de carregar', 'Fechar', {
        duration: 3000,
      });
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
        this.snackBar.open('Erro ao carregar campos', 'Fechar', { duration: 5000 });
      },
    });
  }

  onIncluirCampo(bitNumber: number): void {
    const key = String(bitNumber).padStart(2, '0');
    const currentForm = this.bitsForm();
    const currentKeys = this.sortedKeys();

    if (currentKeys.includes(key)) {
      return;
    }

    const newGroup = new FormGroup<Record<string, FormControl<string>>>({});
    for (const existingKey of currentKeys) {
      newGroup.addControl(existingKey, currentForm.controls[existingKey]);
    }
    newGroup.addControl(key, new FormControl('', { nonNullable: true }));

    const newKeys = this.moveMtiKeyFirst([...currentKeys, key]);

    this.bitsForm.set(newGroup);
    this.sortedKeys.set(newKeys);
    this.updateAvailableBits();
  }

  onRemoverCampo(key: string): void {
    const currentForm = this.bitsForm();
    const currentKeys = this.sortedKeys();

    const newGroup = new FormGroup<Record<string, FormControl<string>>>({});
    for (const existingKey of currentKeys) {
      if (existingKey !== key) {
        newGroup.addControl(existingKey, currentForm.controls[existingKey]);
      }
    }

    const newKeys = currentKeys.filter((k) => k !== key);
    this.bitsForm.set(newGroup);
    this.sortedKeys.set(newKeys);
    this.updateAvailableBits();
  }

  onSalvarTransacao(): void {
    const fieldsMap = this.getRequestFieldsMap();
    if (Object.keys(fieldsMap).length === 0) {
      this.snackBar.open('Adicione pelo menos um campo ISO', 'Fechar', { duration: 3000 });
      return;
    }

    const nomeProduto = this.incluirForm.controls.nomeProduto.value ?? '';
    if (!nomeProduto.trim()) {
      this.snackBar.open('Informe o Nome do Produto', 'Fechar', { duration: 3000 });
      return;
    }

    this.saving.set(true);

    const mtiValue = fieldsMap['00'] ?? '';
    const fieldsWithoutMti = { ...fieldsMap };
    delete fieldsWithoutMti['00'];

    const messageModel = this.incluirForm.controls.messageModel.value ?? '';
    const messageType = this.incluirForm.controls.messageType.value ?? '';
    const bandeira = this.incluirForm.controls.bandeira.value ?? '';
    if (!messageModel || !messageType || !bandeira) {
      this.saving.set(false);
      this.snackBar.open('Preencha os campos Message Model, Tipo Mensagem e Bandeira antes de salvar', 'Fechar', { duration: 3000 });
      return;
    }

    this.isoParserService
      .buildIso(mtiValue, fieldsWithoutMti, messageModel, bandeira, messageType)
      .pipe(
        switchMap((buildResult) => {
          this.incluirForm.controls.isoMessage.setValue(buildResult.isoMessage);

          const tag = this.incluirForm.controls.tag.value ?? '';
          if (!tag.trim()) {
            this.saving.set(false);
            this.snackBar.open('Informe a Tag', 'Fechar', { duration: 3000 });
            return EMPTY;
          }

          const payload: import('../services/iso-parser.service').SalvarTransacaoRequest = {
            id: this.editingTransacaoId() ?? '',
            productName: nomeProduto.trim(),
            tag: tag.trim(),
            description: (this.incluirForm.controls.descricao.value ?? '').trim(),
            isoMessage: buildResult.isoMessage,
            messageModel: messageModel,
            messageType: messageType,
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
          this.snackBar.open('Transação salva com sucesso', 'Fechar', { duration: 5000 });
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Erro ao salvar transação', 'Fechar', { duration: 5000 });
        },
      });
  }

  onDispararFromIncluir(): void {
    const id = this.editingTransacaoId();
    if (!id) return;

    const transacao: TransacaoItem = {
      id,
      productName: (this.incluirForm.controls.nomeProduto.value ?? '').trim(),
      tag: (this.incluirForm.controls.tag.value ?? '').trim(),
      description: (this.incluirForm.controls.descricao.value ?? '').trim(),
      isoMessage: (this.incluirForm.controls.isoMessage.value ?? '').trim(),
      messageModel: (this.incluirForm.controls.messageModel.value ?? '').trim(),
      messageType: (this.incluirForm.controls.messageType.value ?? '').trim(),
      paymentNetwork: (this.incluirForm.controls.bandeira.value ?? '').trim(),
      criadoEm: new Date().toISOString(),
    };

    this.openDispararView(transacao);
  }

  // ─── Disparar view actions ───

  onToggleEstornar(checked: boolean): void {
    this.estornarChecked.set(checked);
    if (checked) {
      const dialogRef = this.dialog.open(BuscarEstornoDialogComponent, {
        width: '560px',
      });
      dialogRef.afterClosed().subscribe((result: TransacaoItem | undefined) => {
        if (result) {
          this.estornoTransacao.set(result);
          this.loadEstornoFields(result);
        } else {
          // User closed without selecting — uncheck
          this.estornarChecked.set(false);
          this.estornoTransacao.set(null);
        }
      });
    } else {
      this.estornoTransacao.set(null);
      this.resetEstornoFields();
    }
  }

  onExecutarTransacao(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    // Validate estorno delay if estornar is checked
    if (this.estornarChecked() && this.estornoTransacao()) {
      if (this.estornoDelay() < 0) {
        this.snackBar.open('Informe um tempo de espera válido', 'Fechar', { duration: 3000 });
        return;
      }
    }

    this.executing.set(true);
    this.showResponse.set(false);
    this.showSuccessOverlay.set(false);

    // Dynamically update Bit 07 with current timestamp before each dispatch
    const newBit07 = this.generateBit07();
    const form = this.bitsForm();
    const bit07FormKey = this.findFormKey(form, 7);
    if (bit07FormKey) {
      form.controls[bit07FormKey].setValue(newBit07);
    }

    // Also update Bit 07 inside Bit 90 of the estorno (if estorno is selected)
    if (this.estornarChecked() && this.estornoTransacao()) {
      this.updateEstornoBit90WithNewBit07(newBit07);
    }

    // Rebuild the main ISO message with updated Bit 07
    const { mti: mtiFromForm, fields: currentFields } = this.getBuildIsoInputFromRequestForm();
    const currentMti = mtiFromForm || '0200';
    const txMessageModel = transacao.messageModel || '';
    const txMessageType = transacao.messageType || '';
    const txPaymentNetwork = transacao.paymentNetwork || '';

    this.isoParserService.buildIso(currentMti, currentFields, txMessageModel, txPaymentNetwork, txMessageType).pipe(
      switchMap((built) => {
        // Update the selected transacao's isoMessage in memory
        const updatedTransacao = { ...transacao, isoMessage: built.isoMessage };
        this.selectedTransacao.set(updatedTransacao);
        return this.isoParserService.executarTransacao(built.isoMessage, txMessageModel, txPaymentNetwork, txMessageType);
      }),
      switchMap(() => this.rebuildEstornoIsoIfNeeded()),
      switchMap(() => this.afterMainTransactionExecuted(transacao)),
    ).subscribe({
      next: () => this.onTransactionSuccess(),
      error: (err) => {
        console.error('Erro ao executar transação:', err);
        this.executing.set(false);
        this.onFecharInterimOverlay();
        this.snackBar.open('Erro ao executar transação', 'Fechar', { duration: 5000 });
      },
    });
  }

  private afterMainTransactionExecuted(_transacao: TransacaoItem) {
    const estorno = this.estornoTransacao();
    if (this.estornarChecked() && estorno) {
      // Show interim overlay (same style as success overlay)
      const delaySeconds = this.estornoDelay() || 0;
      this.interimMessageText.set('Transação financeira enviada, aguardando para enviar o estorno.');
      this.interimCountdownSeconds.set(delaySeconds);
      this.showInterimOverlay.set(true);

      // Countdown for interim overlay
      if (this.interimCountdownInterval) {
        clearInterval(this.interimCountdownInterval);
      }
      if (delaySeconds > 0) {
        this.interimCountdownInterval = setInterval(() => {
          const current = this.interimCountdownSeconds();
          if (current <= 1) {
            if (this.interimCountdownInterval) {
              clearInterval(this.interimCountdownInterval);
              this.interimCountdownInterval = null;
            }
            this.interimCountdownSeconds.set(0);
          } else {
            this.interimCountdownSeconds.set(current - 1);
          }
        }, 1000);
      }

      const delayMs = delaySeconds * 1000;
      const estornoMessageModel = estorno.messageModel || '';
      const estornoMessageType = estorno.messageType || '';
      const estornoPaymentNetwork = estorno.paymentNetwork || '';
      return of(null).pipe(
        delay(delayMs),
        tap(() => this.onFecharInterimOverlay()),
        switchMap(() => {
          const estornoIso = this.estornoIsoMessage() || estorno.isoMessage;
          return this.isoParserService.executarTransacao(estornoIso, estornoMessageModel, estornoPaymentNetwork, estornoMessageType);
        }),
      );
    }
    return of(null);
  }

  private onTransactionSuccess(): void {
    this.executing.set(false);
    const estorno = this.estornoTransacao();
    if (this.estornarChecked() && estorno) {
      this.successMessageText.set('Transação e estorno disparados com sucesso. Verificar logs');
    } else {
      this.successMessageText.set('A transação foi disparada com sucesso. Verificar logs');
    }
    this.countdownSeconds.set(3);
    this.showSuccessOverlay.set(true);

    // Countdown interval (tick every second)
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      const current = this.countdownSeconds();
      if (current <= 1) {
        this.onFecharSuccessOverlay();
      } else {
        this.countdownSeconds.set(current - 1);
      }
    }, 1000);
  }

  onFecharInterimOverlay(): void {
    if (this.interimTimer) {
      clearTimeout(this.interimTimer);
      this.interimTimer = null;
    }
    if (this.interimCountdownInterval) {
      clearInterval(this.interimCountdownInterval);
      this.interimCountdownInterval = null;
    }
    this.showInterimOverlay.set(false);
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

  onEditarTransacao(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    // Switch to incluir view and populate fields from the selected transaction
    this.activeView.set('incluir');
    this.showResponse.set(false);
    this.editingTransacaoId.set(transacao.id);
    this.editingTransacaoId.set(transacao.id);

    this.incluirForm.patchValue({
      nomeProduto: transacao.productName,
      tag: transacao.tag ?? '',
      messageModel: transacao.messageModel ?? '',
      messageType: transacao.messageType ?? '',
      bandeira: transacao.paymentNetwork ?? '',
      descricao: transacao.description,
      isoMessage: transacao.isoMessage,
    });

    // Load ISO fields from the message
    if (transacao.isoMessage && transacao.isoMessage.trim().length >= 4) {
      this.loading.set(true);
      this.isoParserService.parseIso(transacao.isoMessage, transacao.messageModel, transacao.paymentNetwork, transacao.messageType).subscribe({
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
  }

  onExcluirTransacao(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    this.isoParserService.excluirTransacao(transacao.id).subscribe({
      next: (result) => {
        this.snackBar.open(result?.message ?? 'Cenário excluído com sucesso', 'Fechar', { duration: 5000 });
        this.activeView.set('buscar');
        this.showResponse.set(false);
        this.selectedTransacao.set(null);
        this.carregarTransacoesBusca();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir transação', 'Fechar', { duration: 5000 });
      },
    });
  }

  // ─── Private helpers ───

  private openDispararView(transacao: TransacaoItem): void {
    this.selectedTransacao.set(transacao);
    this.activeView.set('disparar');
    this.showResponse.set(false);
    this.estornarChecked.set(false);
    this.conciliarChecked.set(false);
    this.estornoTransacao.set(null);
    this.estornoDelay.set(5);
    this.estornoBit90.set('');
    this.resetEstornoFields();

    // Load ISO request fields from the stored message
    this.loading.set(true);
    this.isoParserService.parseIso(transacao.isoMessage, transacao.messageModel, transacao.paymentNetwork, transacao.messageType).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.mti.set(result.mti ?? '');
        // Remove MTI key from fields map (shown separately as standalone MTI field)
        const fields = { ...result.fields };
        delete fields['00'];
        delete fields['0'];
        // Auto-populate Bit 07 with current timestamp (mmddhhmmss)
        const bit07Key = this.findFieldKey(fields, 7);
        if (bit07Key) {
          fields[bit07Key] = this.generateBit07();
        } else {
          fields['07'] = this.generateBit07();
        }
        this.buildBitsForm(fields);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar campos da transação', 'Fechar', { duration: 5000 });
      },
    });
  }

  private getRequestFieldsMap(): Record<string, string> {
    const form = this.bitsForm();
    const map: Record<string, string> = {};
    for (const key of this.sortedKeys()) {
      map[key] = form.controls[key]?.value ?? '';
    }
    return map;
  }

  private getBuildIsoInputFromRequestForm(): { mti: string; fields: Record<string, string> } {
    const fieldsMap = this.getRequestFieldsMap();
    const mtiValue = fieldsMap['00'] ?? this.mti() ?? '';
    const fieldsWithoutMti = { ...fieldsMap };
    delete fieldsWithoutMti['00'];
    return { mti: mtiValue, fields: fieldsWithoutMti };
  }

  private buildBitsForm(map: Record<string, string>): void {
    const group: Record<string, FormControl<string>> = {};
    const keys = this.moveMtiKeyFirst(Object.keys(map));
    this.sortedKeys.set(keys);

    for (const key of keys) {
      group[key] = new FormControl(map[key], { nonNullable: true });
    }

    this.bitsForm.set(new FormGroup(group));
    this.updateAvailableBits();
  }

  private moveMtiKeyFirst(keys: string[]): string[] {
    const result = [...keys];
    const idx = result.findIndex((k) => {
      const normalized = k.trim();
      return normalized === '00' || normalized === '0';
    });

    if (idx > 0) {
      const [mtiKey] = result.splice(idx, 1);
      result.unshift(mtiKey);
    }

    return result;
  }

  private resetBitsForm(): void {
    this.mti.set('');
    this.bitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.sortedKeys.set([]);
    this.updateAvailableBits();
  }

  private updateAvailableBits(): void {
    const usedKeys = new Set(this.sortedKeys().map((k) => Number(k)));
    const available: number[] = [];
    for (let i = 0; i <= 128; i++) {
      if (i === 1) continue; // skip bit 1
      if (!usedKeys.has(i)) {
        available.push(i);
      }
    }
    this.availableBits.set(available);
  }

  private generateBit07(): string {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${mm}${dd}${hh}${mi}${ss}`;
  }

  private computeBit90(): string {
    const mainMti = this.mti() || '0000';
    const form = this.bitsForm();
    const bit11Key = this.findFormKey(form, 11) || '11';
    const bit07Key = this.findFormKey(form, 7) || '07';
    const bit11 = form.controls[bit11Key]?.value ?? '000000';
    const bit07 = form.controls[bit07Key]?.value ?? '0000000000';

    const mtiPart = mainMti.padStart(4, '0').slice(-4);
    const bit11Part = bit11.padStart(6, '0').slice(-6);
    const bit07Part = bit07.padStart(10, '0').slice(-10);
    return `${mtiPart}${bit11Part}${bit07Part}`;
  }

  /** Update Bit 90 in the estorno form with the new Bit 07 from the main transaction */
  private updateEstornoBit90WithNewBit07(newBit07: string): void {
    const newBit90 = this.computeBit90();
    this.estornoBit90.set(newBit90);

    // Update Bit 90 in the estorno form if it exists
    const estornoForm = this.estornoBitsForm();
    if (estornoForm.controls['90']) {
      estornoForm.controls['90'].setValue(newBit90);
    }
  }

  /** Rebuild the estorno ISO message with updated Bit 90 (after Bit 07 changed) */
  private rebuildEstornoIsoIfNeeded(): Observable<unknown> {
    const estorno = this.estornoTransacao();
    if (!this.estornarChecked() || !estorno || this.estornoSortedKeys().length === 0) {
      return of(null);
    }

    // Collect current estorno fields from form
    const estornoForm = this.estornoBitsForm();
    const estornoFields: Record<string, string> = {};
    for (const key of this.estornoSortedKeys()) {
      estornoFields[key] = estornoForm.controls[key]?.value ?? '';
    }
    const estornoMti = this.estornoMti() || '0400';

    // Rebuild estorno ISO with updated fields (including new Bit 90)
    const estornoMessageModel = estorno.messageModel || '';
    const estornoMessageType = estorno.messageType || '';
    const estornoPaymentNetwork = estorno.paymentNetwork || '';
    return this.isoParserService.buildIso(estornoMti, estornoFields, estornoMessageModel, estornoPaymentNetwork, estornoMessageType).pipe(
      tap((built) => {
        this.estornoIsoMessage.set(built.isoMessage);
      }),
    );
  }

  private loadEstornoFields(estornoItem: TransacaoItem): void {
    this.estornoLoading.set(true);
    const bit90Value = this.computeBit90();
    this.estornoBit90.set(bit90Value);

    // Step 1: Parse the estorno ISO message to get fields
    const estornoMessageModel = estornoItem.messageModel || '';
    const estornoMessageType = estornoItem.messageType || '';
    const estornoPaymentNetwork = estornoItem.paymentNetwork || '';
    this.isoParserService.parseIso(estornoItem.isoMessage, estornoMessageModel, estornoPaymentNetwork, estornoMessageType).pipe(
      switchMap((parsed) => {
        // Step 2: Update Bit 90 in the parsed fields
        const updatedFields = { ...parsed.fields, '90': bit90Value };
        const estornoMti = parsed.mti || '0400';
        // Step 3: Build the new ISO message with updated Bit 90
        return this.isoParserService.buildIso(estornoMti, updatedFields, estornoMessageModel, estornoPaymentNetwork, estornoMessageType).pipe(
          switchMap((built) => {
            // Step 4: Parse the rebuilt ISO to display full fields
            this.estornoIsoMessage.set(built.isoMessage);
            return this.isoParserService.parseIso(built.isoMessage, estornoMessageModel, estornoPaymentNetwork, estornoMessageType);
          }),
        );
      }),
    ).subscribe({
      next: (finalParsed) => {
        this.estornoLoading.set(false);
        this.estornoMti.set(finalParsed.mti || '');
        const keys = Object.keys(finalParsed.fields);
        this.estornoSortedKeys.set(keys);
        const group: Record<string, FormControl<string>> = {};
        for (const key of keys) {
          group[key] = new FormControl(finalParsed.fields[key], { nonNullable: true });
        }
        this.estornoBitsForm.set(new FormGroup(group));
      },
      error: () => {
        this.estornoLoading.set(false);
        this.snackBar.open('Erro ao carregar campos do estorno', 'Fechar', { duration: 5000 });
      },
    });
  }

  private resetEstornoFields(): void {
    this.estornoMti.set('');
    this.estornoSortedKeys.set([]);
    this.estornoBitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.estornoIsoMessage.set('');
    this.estornoBit90.set('');
  }

  /** Find the key for a given bit number in a fields map (handles '7' vs '07') */
  private findFieldKey(fields: Record<string, string>, bitNum: number): string | null {
    const padded = String(bitNum).padStart(2, '0');
    const unpadded = String(bitNum);
    if (padded in fields) return padded;
    if (unpadded in fields) return unpadded;
    return null;
  }

  /** Find the key for a given bit number in a FormGroup (handles '7' vs '07') */
  private findFormKey(form: FormGroup, bitNum: number): string | null {
    const padded = String(bitNum).padStart(2, '0');
    const unpadded = String(bitNum);
    if (form.controls[padded]) return padded;
    if (form.controls[unpadded]) return unpadded;
    return null;
  }

  /** Rebuild the main ISO message when the user edits a field in Disparar view */
  onFieldChanged(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    const { mti: mtiFromForm, fields: currentFields } = this.getBuildIsoInputFromRequestForm();
    const currentMti = mtiFromForm || '0200';
    const txMessageModel = transacao.messageModel || '';
    const txMessageType = transacao.messageType || '';
    const txPaymentNetwork = transacao.paymentNetwork || '';

    this.isoParserService.buildIso(currentMti, currentFields, txMessageModel, txPaymentNetwork, txMessageType).subscribe({
      next: (built) => {
        const updatedTransacao = { ...transacao, isoMessage: built.isoMessage };
        this.selectedTransacao.set(updatedTransacao);
      },
      error: () => {
        // silently ignore rebuild errors while editing
      },
    });
  }

  /** Rebuild the estorno ISO message when the user edits a field in Disparar view */
  onEstornoFieldChanged(): void {
    const estorno = this.estornoTransacao();
    if (!estorno || this.estornoSortedKeys().length === 0) return;

    const estornoForm = this.estornoBitsForm();
    const estornoFields: Record<string, string> = {};
    for (const key of this.estornoSortedKeys()) {
      estornoFields[key] = estornoForm.controls[key]?.value ?? '';
    }
    const estornoMti = this.estornoMti() || '0400';
    const estornoMessageModel = estorno.messageModel || '';
    const estornoMessageType = estorno.messageType || '';
    const estornoPaymentNetwork = estorno.paymentNetwork || '';

    this.isoParserService.buildIso(estornoMti, estornoFields, estornoMessageModel, estornoPaymentNetwork, estornoMessageType).subscribe({
      next: (built) => {
        this.estornoIsoMessage.set(built.isoMessage);
      },
      error: () => {
        // silently ignore rebuild errors while editing
      },
    });
  }

  private carregarTransacoesBusca(nomeProduto?: string, tag?: string, bandeira?: string): void {
    this.buscarLoading.set(true);
    this.isoParserService.consultarTransacoes(nomeProduto, tag, bandeira).subscribe({
      next: (list) => {
        this.buscarLoading.set(false);
        this.buscarTransacoes.set(list);
      },
      error: () => {
        this.buscarLoading.set(false);
        this.buscarTransacoes.set([]);
      },
    });
  }
}
