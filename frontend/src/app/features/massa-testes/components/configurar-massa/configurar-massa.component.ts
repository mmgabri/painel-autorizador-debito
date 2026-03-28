import { Component, Input, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NotificationService } from '../../../../core/services/notification.service';
import { MassaTestesService, MassaTestesItem, SalvarMassaTestesRequest } from '../../services/massa-testes.service';

@Component({
  selector: 'app-configurar-massa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonToggleModule,
  ],
  templateUrl: './configurar-massa.component.html',
  styleUrl: './configurar-massa.component.scss',
})
export class ConfigurarMassaComponent implements OnInit {
  @Input() massa: MassaTestesItem | null = null;

  private readonly massaTestesService = inject(MassaTestesService);
  private readonly notif = inject(NotificationService);

  readonly bandeiraOptions = ['MASTERCARD', 'VISA'];
  readonly modeloMensagemOptions = ['SINGLE_MESSAGE', 'DUAL_MESSAGE'];
  readonly tipoContaOptions = ['C', 'P'];
  readonly tipoPessoaOptions = ['F', 'J'];

  form = new FormGroup({
    // Dados
    bandeira: new FormControl('', [Validators.required]),
    modeloMensagem: new FormControl('', [Validators.required]),
    tag: new FormControl('', [Validators.required]),
    descricao: new FormControl(''),
    // Dados Cartão
    cartao: new FormControl('', [Validators.required, Validators.maxLength(19), Validators.pattern(/^\d*$/)]),
    dataVencimento: new FormControl('11-10-2035', [Validators.required]),
    codigoFuncionalidadeCartao: new FormControl('M', [Validators.required]),
    codigoServicoPrimeiroDigito: new FormControl('2', [Validators.required]),
    codigoSituacao: new FormControl('C', [Validators.required]),
    codigoStatus: new FormControl('00', [Validators.required]),
    codigoTecnologia: new FormControl('PP', [Validators.required]),
    codigoTipo: new FormControl('025', [Validators.required]),
    // Dados Conta Corrente
    idConta: new FormControl('', [Validators.required, Validators.maxLength(36), Validators.pattern(/^[a-zA-Z0-9]*$/)]),
    agencia: new FormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern(/^\d*$/)]),
    conta: new FormControl('', [Validators.required, Validators.maxLength(7), Validators.pattern(/^\d*$/)]),
    dac: new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern(/^\d*$/)]),
    sufixo: new FormControl('100000', [Validators.required]),
    tipoConta: new FormControl('C', [Validators.required]),
    titular: new FormControl('1', [Validators.required, Validators.maxLength(6), Validators.pattern(/^\d*$/)]),
    idCategoria: new FormControl('583', [Validators.required, Validators.maxLength(3), Validators.pattern(/^\d*$/)]),
    codigoSegmento: new FormControl('4100', [Validators.required, Validators.maxLength(4)]),
    codigoTipoPessoa: new FormControl('F', [Validators.required]),
  });

  saving = signal(false);
  savedSuccessfully = signal(false);
  canCreateNext = signal(false);
  private readonly editingId = signal<string | null>(null);

  ngOnInit(): void {
    if (this.massa) {
      this.editingId.set(this.massa.id);
      this.form.patchValue({
        bandeira: this.massa.bandeira,
        modeloMensagem: this.massa.modeloMensagem,
        tag: this.massa.tag,
        descricao: this.massa.descricao,
        cartao: this.massa.cartao,
        dataVencimento: this.massa.dataVencimento,
        codigoFuncionalidadeCartao: this.massa.codigoFuncionalidadeCartao,
        codigoServicoPrimeiroDigito: this.massa.codigoServicoPrimeiroDigito,
        codigoSituacao: this.massa.codigoSituacao,
        codigoStatus: this.massa.codigoStatus,
        codigoTecnologia: this.massa.codigoTecnologia,
        codigoTipo: this.massa.codigoTipo,
        idConta: this.massa.idConta,
        agencia: this.massa.agencia,
        conta: this.massa.conta,
        dac: this.massa.dac,
        sufixo: this.massa.sufixo,
        tipoConta: this.massa.tipoConta,
        titular: this.massa.titular,
        idCategoria: this.massa.idCategoria,
        codigoSegmento: this.massa.codigoSegmento,
        codigoTipoPessoa: this.massa.codigoTipoPessoa,
      });
      this.savedSuccessfully.set(true);
    }
  }

  filterDigits(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/\D/g, '');
    input.value = filtered;
    this.form.get(controlName)?.setValue(filtered, { emitEvent: false });
  }

  filterAlphanumeric(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^a-zA-Z0-9]/g, '');
    input.value = filtered;
    this.form.get(controlName)?.setValue(filtered, { emitEvent: false });
  }

  onSalvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.notif.warn('Verifique os campos inválidos antes de salvar');
      return;
    }

    const isNew = !this.editingId();
    const v = this.form.getRawValue();

    this.saving.set(true);
    const payload: SalvarMassaTestesRequest = {
      id: this.editingId() ?? undefined,
      bandeira: v.bandeira ?? '',
      modeloMensagem: v.modeloMensagem ?? '',
      tag: (v.tag ?? '').trim(),
      descricao: (v.descricao ?? '').trim(),
      cartao: (v.cartao ?? '').trim(),
      dataVencimento: (v.dataVencimento ?? '').trim(),
      codigoFuncionalidadeCartao: (v.codigoFuncionalidadeCartao ?? '').trim(),
      codigoServicoPrimeiroDigito: (v.codigoServicoPrimeiroDigito ?? '').trim(),
      codigoSituacao: (v.codigoSituacao ?? '').trim(),
      codigoStatus: (v.codigoStatus ?? '').trim(),
      codigoTecnologia: (v.codigoTecnologia ?? '').trim(),
      codigoTipo: (v.codigoTipo ?? '').trim(),
      idConta: (v.idConta ?? '').trim(),
      agencia: (v.agencia ?? '').trim(),
      conta: (v.conta ?? '').trim(),
      dac: (v.dac ?? '').trim(),
      sufixo: (v.sufixo ?? '').trim(),
      tipoConta: (v.tipoConta ?? '').trim(),
      titular: (v.titular ?? '').trim(),
      idCategoria: (v.idCategoria ?? '').trim(),
      codigoSegmento: (v.codigoSegmento ?? '').trim(),
      codigoTipoPessoa: (v.codigoTipoPessoa ?? '').trim(),
    };

    this.massaTestesService.salvar(payload).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.editingId.set(result.id);
        this.savedSuccessfully.set(true);
        if (isNew) {
          this.canCreateNext.set(true);
        }
        this.notif.success('Massa de testes salva com sucesso');
      },
      error: () => {
        this.saving.set(false);
        this.notif.error('Erro ao salvar massa de testes');
      },
    });
  }

  onCriarProximo(): void {
    this.massa = null;
    this.editingId.set(null);
    this.savedSuccessfully.set(false);
    this.canCreateNext.set(false);
    this.form.reset({
      bandeira: '',
      modeloMensagem: '',
      tag: '',
      descricao: '',
      cartao: '',
      dataVencimento: '11-10-2035',
      codigoFuncionalidadeCartao: 'M',
      codigoServicoPrimeiroDigito: '2',
      codigoSituacao: 'C',
      codigoStatus: '00',
      codigoTecnologia: 'PP',
      codigoTipo: '025',
      idConta: '',
      agencia: '',
      conta: '',
      dac: '',
      sufixo: '100000',
      tipoConta: 'C',
      titular: '1',
      idCategoria: '583',
      codigoSegmento: '4100',
      codigoTipoPessoa: 'F',
    });
  }

  onCarregarDadinho(): void {
    const id = this.editingId();
    if (!id) return;
    this.massaTestesService.carregarDadinho(id).subscribe({
      next: () => { this.notif.success('Dadinho carregado com sucesso'); },
      error: () => { this.notif.error('Erro ao carregar dadinho'); },
    });
  }
}
