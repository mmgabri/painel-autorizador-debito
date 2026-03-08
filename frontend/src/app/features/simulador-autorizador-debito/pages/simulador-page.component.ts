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
import { switchMap, EMPTY, delay, of, tap } from 'rxjs';
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
    descricao: new FormControl(''),
    isoMessage: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

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
  estornoTransacao = signal<TransacaoItem | null>(null);
  estornoDelay = signal(0);
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
    this.activeView.set('buscar');
    this.carregarTransacoesBusca();
  }

  // ─── Buscar view actions ───

  onFiltrarBusca(): void {
    this.carregarTransacoesBusca(this.buscarFiltro, this.buscarFiltroTag);
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
      nomeProduto: item.nomeProduto,
      tag: item.tag ?? '',
      descricao: item.descricao,
      isoMessage: item.isoMessage,
    });

    if (item.isoMessage && item.isoMessage.trim().length >= 4) {
      this.loading.set(true);
      this.isoParserService.parseIso(item.isoMessage).subscribe({
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
    this.carregarTransacoesBusca();
  }

  // ─── Incluir view actions ───

  onCarregarCampos(): void {
    const isoMessage = this.incluirForm.controls.isoMessage.value ?? '';
    if (!isoMessage || isoMessage.trim().length < 4) {
      this.snackBar.open('Informe a mensagem ISO com no mínimo 4 caracteres', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    this.loading.set(true);

    this.isoParserService.parseIso(isoMessage).subscribe({
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

    const newKeys = [...currentKeys, key].sort((a, b) => Number(a) - Number(b));

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

    this.isoParserService
      .buildIso(mtiValue, fieldsWithoutMti)
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
            nomeProduto: nomeProduto.trim(),
            tag: tag.trim(),
            descricao: (this.incluirForm.controls.descricao.value ?? '').trim(),
            isoMessage: buildResult.isoMessage,
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
      nomeProduto: (this.incluirForm.controls.nomeProduto.value ?? '').trim(),
      tag: (this.incluirForm.controls.tag.value ?? '').trim(),
      descricao: (this.incluirForm.controls.descricao.value ?? '').trim(),
      isoMessage: (this.incluirForm.controls.isoMessage.value ?? '').trim(),
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
    if (form.controls['07']) {
      form.controls['07'].setValue(newBit07);
    }

    // Rebuild the main ISO message with updated Bit 07
    const currentFields = this.getRequestFieldsMap();
    const currentMti = this.mti() || '0200';

    this.isoParserService.buildIso(currentMti, currentFields).pipe(
      switchMap((built) => {
        // Update the selected transacao's isoMessage in memory
        const updatedTransacao = { ...transacao, isoMessage: built.isoMessage };
        this.selectedTransacao.set(updatedTransacao);
        return this.isoParserService.executarTransacao(built.isoMessage);
      }),
      switchMap(() => this.afterMainTransactionExecuted(transacao)),
    ).subscribe({
      next: () => this.onTransactionSuccess(),
      error: () => {
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
      this.interimMessageText.set('Transação financeira enviada, aguardando pra enviar o estorno');
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
      return of(null).pipe(
        delay(delayMs),
        tap(() => this.onFecharInterimOverlay()),
        switchMap(() => {
          const estornoIso = this.estornoIsoMessage() || estorno.isoMessage;
          return this.isoParserService.executarTransacao(estornoIso);
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
    this.countdownSeconds.set(5);
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

    this.incluirForm.patchValue({
      nomeProduto: transacao.nomeProduto,
      tag: transacao.tag ?? '',
      descricao: transacao.descricao,
      isoMessage: transacao.isoMessage,
    });

    // Load ISO fields from the message
    if (transacao.isoMessage && transacao.isoMessage.trim().length >= 4) {
      this.loading.set(true);
      this.isoParserService.parseIso(transacao.isoMessage).subscribe({
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
    this.estornoTransacao.set(null);
    this.estornoDelay.set(0);
    this.estornoBit90.set('');
    this.resetEstornoFields();

    // Load ISO request fields from the stored message
    this.loading.set(true);
    this.isoParserService.parseIso(transacao.isoMessage).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.mti.set(result.mti ?? '');
        // Auto-populate Bit 07 with current timestamp (mmddhhmmss)
        const fields = { ...result.fields };
        fields['07'] = this.generateBit07();
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

  private buildBitsForm(map: Record<string, string>): void {
    const group: Record<string, FormControl<string>> = {};
    const keys = Object.keys(map).sort((a, b) => Number(a) - Number(b));
    this.sortedKeys.set(keys);

    for (const key of keys) {
      group[key] = new FormControl(map[key], { nonNullable: true });
    }

    this.bitsForm.set(new FormGroup(group));
    this.updateAvailableBits();
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
    const bit11 = form.controls['11']?.value ?? '000000';
    const bit07 = form.controls['07']?.value ?? '0000000000';

    const mtiPart = mainMti.padStart(4, '0').slice(-4);
    const bit11Part = bit11.padStart(6, '0').slice(-6);
    const bit07Part = bit07.padStart(10, '0').slice(-10);
    return `${mtiPart}${bit11Part}${bit07Part}`;
  }

  private loadEstornoFields(estornoItem: TransacaoItem): void {
    this.estornoLoading.set(true);
    const bit90Value = this.computeBit90();
    this.estornoBit90.set(bit90Value);

    // Step 1: Parse the estorno ISO message to get fields
    this.isoParserService.parseIso(estornoItem.isoMessage).pipe(
      switchMap((parsed) => {
        // Step 2: Update Bit 90 in the parsed fields
        const updatedFields = { ...parsed.fields, '90': bit90Value };
        const estornoMti = parsed.mti || '0400';
        // Step 3: Build the new ISO message with updated Bit 90
        return this.isoParserService.buildIso(estornoMti, updatedFields).pipe(
          switchMap((built) => {
            // Step 4: Parse the rebuilt ISO to display full fields
            this.estornoIsoMessage.set(built.isoMessage);
            return this.isoParserService.parseIso(built.isoMessage);
          }),
        );
      }),
    ).subscribe({
      next: (finalParsed) => {
        this.estornoLoading.set(false);
        this.estornoMti.set(finalParsed.mti || '');
        const keys = Object.keys(finalParsed.fields).sort((a, b) => Number(a) - Number(b));
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

  private carregarTransacoesBusca(nomeProduto?: string, tag?: string): void {
    this.buscarLoading.set(true);
    this.isoParserService.consultarTransacoes(nomeProduto, tag).subscribe({
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
