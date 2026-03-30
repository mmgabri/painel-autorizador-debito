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
    paymentNetwork: new FormControl('', [Validators.required]),
    messageModel: new FormControl('', [Validators.required]),
    tag: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    // Dados Cartão
    cardNumber: new FormControl('', [Validators.required, Validators.maxLength(19), Validators.pattern(/^\d*$/)]),
    expiryDate: new FormControl('11-10-2035', [Validators.required]),
    cardFunctionalityCode: new FormControl('M', [Validators.required]),
    firstDigitServiceCode: new FormControl('2', [Validators.required]),
    situationCode: new FormControl('C', [Validators.required]),
    statusCode: new FormControl('00', [Validators.required]),
    technologyCode: new FormControl('PP', [Validators.required]),
    typeCode: new FormControl('025', [Validators.required]),
    // Dados Conta Corrente
    accountId: new FormControl('', [Validators.required, Validators.maxLength(36), Validators.pattern(/^[a-zA-Z0-9]*$/)]),
    agency: new FormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern(/^\d*$/)]),
    account: new FormControl('', [Validators.required, Validators.maxLength(7), Validators.pattern(/^\d*$/)]),
    dac: new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern(/^\d*$/)]),
    suffix: new FormControl('100000', [Validators.required]),
    accountType: new FormControl('C', [Validators.required]),
    accountHolder: new FormControl('1', [Validators.required, Validators.maxLength(6), Validators.pattern(/^\d*$/)]),
    categoryId: new FormControl('583', [Validators.required, Validators.maxLength(3), Validators.pattern(/^\d*$/)]),
    segmentCode: new FormControl('4100', [Validators.required, Validators.maxLength(4)]),
    personTypeCode: new FormControl('F', [Validators.required]),
  });

  saving = signal(false);
  savedSuccessfully = signal(false);
  canCreateNext = signal(false);
  private readonly editingId = signal<string | null>(null);

  ngOnInit(): void {
    if (this.massa) {
      this.editingId.set(this.massa.id);
      this.form.patchValue({
        paymentNetwork: this.massa.paymentNetwork,
        messageModel: this.massa.messageModel,
        tag: this.massa.tag,
        description: this.massa.description,
        cardNumber: this.massa.cardNumber,
        expiryDate: this.massa.expiryDate,
        cardFunctionalityCode: this.massa.cardFunctionalityCode,
        firstDigitServiceCode: this.massa.firstDigitServiceCode,
        situationCode: this.massa.situationCode,
        statusCode: this.massa.statusCode,
        technologyCode: this.massa.technologyCode,
        typeCode: this.massa.typeCode,
        accountId: this.massa.accountId,
        agency: this.massa.agency,
        account: this.massa.account,
        dac: this.massa.dac,
        suffix: this.massa.suffix,
        accountType: this.massa.accountType,
        accountHolder: this.massa.accountHolder,
        categoryId: this.massa.categoryId,
        segmentCode: this.massa.segmentCode,
        personTypeCode: this.massa.personTypeCode,
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

  onBandeiraChange(value: string): void {
    if (value === 'VISA' && this.form.controls.messageModel.value !== 'DUAL_MESSAGE') {
      this.form.controls.messageModel.setValue('DUAL_MESSAGE');
    }
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
      paymentNetwork: v.paymentNetwork ?? '',
      messageModel: v.messageModel ?? '',
      tag: (v.tag ?? '').trim(),
      description: (v.description ?? '').trim(),
      cardNumber: (v.cardNumber ?? '').trim(),
      expiryDate: (v.expiryDate ?? '').trim(),
      cardFunctionalityCode: (v.cardFunctionalityCode ?? '').trim(),
      firstDigitServiceCode: (v.firstDigitServiceCode ?? '').trim(),
      situationCode: (v.situationCode ?? '').trim(),
      statusCode: (v.statusCode ?? '').trim(),
      technologyCode: (v.technologyCode ?? '').trim(),
      typeCode: (v.typeCode ?? '').trim(),
      accountId: (v.accountId ?? '').trim(),
      agency: (v.agency ?? '').trim(),
      account: (v.account ?? '').trim(),
      dac: (v.dac ?? '').trim(),
      suffix: (v.suffix ?? '').trim(),
      accountType: (v.accountType ?? '').trim(),
      accountHolder: (v.accountHolder ?? '').trim(),
      categoryId: (v.categoryId ?? '').trim(),
      segmentCode: (v.segmentCode ?? '').trim(),
      personTypeCode: (v.personTypeCode ?? '').trim(),
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
      },
    });
  }

  onCriarProximo(): void {
    this.massa = null;
    this.editingId.set(null);
    this.savedSuccessfully.set(false);
    this.canCreateNext.set(false);
    this.form.reset({
      paymentNetwork: '',
      messageModel: '',
      tag: '',
      description: '',
      cardNumber: '',
      expiryDate: '11-10-2035',
      cardFunctionalityCode: 'M',
      firstDigitServiceCode: '2',
      situationCode: 'C',
      statusCode: '00',
      technologyCode: 'PP',
      typeCode: '025',
      accountId: '',
      agency: '',
      account: '',
      dac: '',
      suffix: '100000',
      accountType: 'C',
      accountHolder: '1',
      categoryId: '583',
      segmentCode: '4100',
      personTypeCode: 'F',
    });
  }

  onCarregarDadinho(): void {
    const id = this.editingId();
    if (!id) return;
    this.massaTestesService.carregarDadinho(id).subscribe({
      next: () => { this.notif.success('Dadinho carregado com sucesso'); },
      error: () => {},
    });
  }
}
