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
import { switchMap, EMPTY } from 'rxjs';
import { IsoParserService, TransacaoItem } from '../services/iso-parser.service';

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

  constructor(
    private readonly isoParserService: IsoParserService,
    private readonly snackBar: MatSnackBar,
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
        this.buildBitsForm(result.fields);
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

    this.isoParserService
      .buildIso(this.mti(), fieldsMap)
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
            nomeProduto: nomeProduto.trim(),
            tag: tag.trim(),
            descricao: (this.incluirForm.controls.descricao.value ?? '').trim(),
            isoMessage: buildResult.isoMessage,
          };
          const currentId = this.editingTransacaoId();
          if (currentId) {
            payload.id = currentId;
          }
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

  onExecutarTransacao(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    this.executing.set(true);
    this.showResponse.set(false);

    this.isoParserService.executarTransacao(transacao.isoMessage).subscribe({
      next: (result) => {
        this.executing.set(false);
        this.responseFields.set(result.fields);
        const keys = Object.keys(result.fields).sort((a, b) => Number(a) - Number(b));
        this.responseSortedKeys.set(keys);
        this.responseMessage.set(result.message);
        this.showResponse.set(true);
      },
      error: () => {
        this.executing.set(false);
        this.snackBar.open('Erro ao executar transação', 'Fechar', { duration: 5000 });
      },
    });
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
          this.buildBitsForm(result.fields);
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
        this.snackBar.open(result.message, 'Fechar', { duration: 5000 });
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

    // Load ISO request fields from the stored message
    this.loading.set(true);
    console.log('Parsing ISO message for execution:', transacao);
    this.isoParserService.parseIso(transacao.isoMessage).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.mti.set(result.mti ?? '');
        this.buildBitsForm(result.fields);
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
    for (let i = 2; i <= 128; i++) {
      if (!usedKeys.has(i)) {
        available.push(i);
      }
    }
    this.availableBits.set(available);
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
