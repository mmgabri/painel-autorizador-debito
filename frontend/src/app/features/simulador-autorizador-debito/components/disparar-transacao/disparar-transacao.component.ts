import { Component, Input, OnInit, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, delay, of, tap, Observable } from 'rxjs';
import { IsoParserService, TransacaoItem } from '../../services/iso-parser.service';
import { BuscarEstornoDialogComponent, BuscarDialogFiltro } from '../buscar-estorno-dialog.component';
import { BuscarConciliacaoDialogComponent } from '../buscar-conciliacao-dialog.component';
import { ConfirmarExclusaoDialogComponent } from '../buscar-cenarios/confirmar-exclusao-dialog.component';

@Component({
  selector: 'app-disparar-transacao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './disparar-transacao.component.html',
  styleUrl: './disparar-transacao.component.scss',
})
export class DispararTransacaoComponent implements OnInit {
  @Input({ required: true }) transacao!: TransacaoItem;

  readonly voltou = output<void>();
  readonly editou = output<TransacaoItem>();
  readonly excluiu = output<void>();

  private readonly isoParserService = inject(IsoParserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  selectedTransacao = signal<TransacaoItem | null>(null);
  showBitLabel = computed(() => {
    const t = this.selectedTransacao();
    if (!t) return true;
    return t.messageType !== 'CONCILIACAO';
  });
  mti = signal('');
  bitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  sortedKeys = signal<string[]>([]);
  loading = signal(false);
  executing = signal(false);

  // Estorno
  estornarChecked = signal(false);
  estornoTransacao = signal<TransacaoItem | null>(null);
  estornoDelay = signal(5);
  estornoBit90 = signal('');
  estornoMti = signal('');
  estornoSortedKeys = signal<string[]>([]);
  estornoBitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  estornoIsoMessage = signal('');
  estornoLoading = signal(false);

  // Conciliacao
  conciliarChecked = signal(false);
  conciliacaoTransacao = signal<TransacaoItem | null>(null);
  conciliacaoDelay = signal(10);
  conciliacaoMti = signal('');
  conciliacaoSortedKeys = signal<string[]>([]);
  conciliacaoBitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  conciliacaoIsoMessage = signal('');
  conciliacaoLoading = signal(false);

  // Success overlay
  showSuccessOverlay = signal(false);
  countdownSeconds = signal(3);
  successMessageText = signal('A transação foi disparada com sucesso. Verificar logs');
  private successTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  // Interim overlay
  showInterimOverlay = signal(false);
  interimCountdownSeconds = signal(5);
  interimTotalSeconds = signal(5);
  interimMessageText = signal('');
  private interimTimer: ReturnType<typeof setTimeout> | null = null;
  private interimCountdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.selectedTransacao.set(this.transacao);
    this.loading.set(true);
    this.isoParserService
      .parseIso(this.transacao.message, this.transacao.messageModel, this.transacao.paymentNetwork, this.transacao.messageType)
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.mti.set(result.mti ?? '');
          const fields = { ...result.fields };
          delete fields['00'];
          delete fields['0'];
          if (this.transacao.messageType === 'CONCILIACAO') {
            const bit07Key = this.findFieldKey(fields, 7);
            if (bit07Key) delete fields[bit07Key];
          } else {
            const bit07Key = this.findFieldKey(fields, 7);
            if (bit07Key) {
              fields[bit07Key] = this.generateBit07();
            } else {
              fields['07'] = this.generateBit07();
            }
          }
          this.buildBitsForm(fields, this.transacao.messageType === 'CONCILIACAO');
        },
        error: () => {
          this.loading.set(false);
          this.notif.error('Erro ao carregar campos da transação');
        },
      });
  }

  onToggleEstornar(checked: boolean): void {
    this.estornarChecked.set(checked);
    if (checked) {
      const filtro: BuscarDialogFiltro = { paymentNetwork: this.transacao.paymentNetwork, messageModel: this.transacao.messageModel };
      const dialogRef = this.dialog.open(BuscarEstornoDialogComponent, { width: '520px', data: filtro, panelClass: 'itau-dialog-panel' });
      dialogRef.afterClosed().subscribe((result: TransacaoItem | undefined) => {
        if (result) {
          this.estornoTransacao.set(result);
          this.loadEstornoFields(result);
        } else {
          this.estornarChecked.set(false);
          this.estornoTransacao.set(null);
        }
      });
    } else {
      this.estornoTransacao.set(null);
      this.resetEstornoFields();
    }
  }

  onToggleConciliar(checked: boolean): void {
    this.conciliarChecked.set(checked);
    if (checked) {
      const filtroConciliacao: BuscarDialogFiltro = { paymentNetwork: this.transacao.paymentNetwork, messageModel: this.transacao.messageModel };
      const dialogRef = this.dialog.open(BuscarConciliacaoDialogComponent, { width: '520px', data: filtroConciliacao, panelClass: 'itau-dialog-panel' });
      dialogRef.afterClosed().subscribe((result: TransacaoItem | undefined) => {
        if (result) {
          this.conciliacaoTransacao.set(result);
          this.loadConciliacaoFields(result);
        } else {
          this.conciliarChecked.set(false);
          this.conciliacaoTransacao.set(null);
        }
      });
    } else {
      this.conciliacaoTransacao.set(null);
      this.resetConciliacaoFields();
    }
  }

  onExecutarTransacao(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    if (this.estornarChecked() && this.estornoTransacao() && this.estornoDelay() < 0) {
      this.notif.warn('Informe um tempo de espera válido para o estorno');
      return;
    }

    if (this.conciliarChecked() && this.conciliacaoTransacao() && this.conciliacaoDelay() < 0) {
      this.notif.warn('Informe um tempo de espera válido para a conciliação');
      return;
    }

    this.executing.set(true);
    this.showSuccessOverlay.set(false);

    const newBit07 = this.generateBit07();
    const form = this.bitsForm();
    const bit07FormKey = this.findFormKey(form, 7);
    if (bit07FormKey) {
      form.controls[bit07FormKey].setValue(newBit07);
    }

    if (this.estornarChecked() && this.estornoTransacao()) {
      this.updateEstornoBit90WithNewBit07(newBit07);
    }

    const { mti: mtiFromForm, fields: currentFields } = this.getBuildIsoInputFromRequestForm();
    const currentMti = mtiFromForm || '0200';
    const txMessageModel = transacao.messageModel || '';
    const txMessageType = transacao.messageType || '';
    const txPaymentNetwork = transacao.paymentNetwork || '';

    this.isoParserService
      .buildIso(currentMti, currentFields, txMessageModel, txPaymentNetwork, txMessageType)
      .pipe(
        switchMap((built) => {
          this.selectedTransacao.set({ ...transacao, message: built.message });
          return this.isoParserService.executarTransacao(built.message, txMessageModel, txPaymentNetwork, txMessageType);
        }),
        switchMap(() => this.rebuildEstornoIsoIfNeeded()),
        switchMap(() => this.rebuildConciliacaoIsoIfNeeded()),
        switchMap(() => this.dispatchEstornoIfNeeded()),
        switchMap(() => this.dispatchConciliacaoIfNeeded()),
      )
      .subscribe({
        next: () => this.onTransactionSuccess(),
        error: (err) => {
          console.error('Erro ao executar transação:', err);
          this.executing.set(false);
          this.onFecharInterimOverlay();
          this.notif.error('Erro ao executar transação');
        },
      });
  }

  onFieldChanged(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    const { mti: mtiFromForm, fields: currentFields } = this.getBuildIsoInputFromRequestForm();
    const currentMti = mtiFromForm || '0200';

    this.isoParserService
      .buildIso(currentMti, currentFields, transacao.messageModel, transacao.paymentNetwork, transacao.messageType)
      .subscribe({
        next: (built) => {
          this.selectedTransacao.set({ ...transacao, message: built.message });
        },
        error: () => {},
      });
  }

  onEstornoFieldChanged(): void {
    const estorno = this.estornoTransacao();
    if (!estorno || this.estornoSortedKeys().length === 0) return;

    const estornoForm = this.estornoBitsForm();
    const estornoFields: Record<string, string> = {};
    for (const key of this.estornoSortedKeys()) {
      estornoFields[key] = estornoForm.controls[key]?.value ?? '';
    }

    this.isoParserService
      .buildIso(this.estornoMti() || '0400', estornoFields, estorno.messageModel, estorno.paymentNetwork, estorno.messageType)
      .subscribe({
        next: (built) => {
          this.estornoIsoMessage.set(built.message);
        },
        error: () => {},
      });
  }

  onConciliacaoFieldChanged(): void {
    const conciliacao = this.conciliacaoTransacao();
    if (!conciliacao || this.conciliacaoSortedKeys().length === 0) return;

    const conciliacaoForm = this.conciliacaoBitsForm();
    const conciliacaoFields: Record<string, string> = {};
    for (const key of this.conciliacaoSortedKeys()) {
      conciliacaoFields[key] = conciliacaoForm.controls[key]?.value ?? '';
    }

    this.isoParserService
      .buildIso(this.conciliacaoMti() || 'FREC', conciliacaoFields, conciliacao.messageModel, conciliacao.paymentNetwork, conciliacao.messageType)
      .subscribe({
        next: (built) => {
          this.conciliacaoIsoMessage.set(built.message);
        },
        error: () => {},
      });
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

  onVoltar(): void {
    this.voltou.emit();
  }

  onEditar(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;
    this.editou.emit(transacao);
  }

  onExcluir(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    const ref = this.dialog.open(ConfirmarExclusaoDialogComponent, {
      width: '360px',
      panelClass: 'itau-dialog-panel',
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.isoParserService.excluirTransacao(transacao.id).subscribe({
        next: (result) => {
          this.notif.success(result?.message ?? 'Cenário excluído com sucesso');
          this.excluiu.emit();
        },
        error: () => {
          this.notif.error('Erro ao excluir transação');
        },
      });
    });
  }

  private dispatchEstornoIfNeeded(): Observable<unknown> {
    const estorno = this.estornoTransacao();
    if (!this.estornarChecked() || !estorno) return of(null);

    const delaySeconds = this.estornoDelay() || 0;
    this.startInterimCountdown('Transação financeira enviada, aguardando para enviar o estorno.', delaySeconds);

    return of(null).pipe(
      delay(delaySeconds * 1000),
      tap(() => this.onFecharInterimOverlay()),
      switchMap(() => {
        const estornoIso = this.estornoIsoMessage() || estorno.message;
        return this.isoParserService.executarTransacao(estornoIso, estorno.messageModel, estorno.paymentNetwork, estorno.messageType);
      }),
    );
  }

  private dispatchConciliacaoIfNeeded(): Observable<unknown> {
    const conciliacao = this.conciliacaoTransacao();
    if (!this.conciliarChecked() || !conciliacao) return of(null);

    const delaySeconds = this.conciliacaoDelay() || 0;
    const prevMsg = this.estornarChecked() && this.estornoTransacao()
      ? 'Estorno enviado, aguardando para enviar a conciliação.'
      : 'Transação enviada, aguardando para enviar a conciliação.';
    this.startInterimCountdown(prevMsg, delaySeconds);

    return of(null).pipe(
      delay(delaySeconds * 1000),
      tap(() => this.onFecharInterimOverlay()),
      switchMap(() => {
        const conciliacaoIso = this.conciliacaoIsoMessage() || conciliacao.message;
        return this.isoParserService.executarTransacao(conciliacaoIso, conciliacao.messageModel, conciliacao.paymentNetwork, conciliacao.messageType);
      }),
    );
  }

  private startInterimCountdown(message: string, delaySeconds: number): void {
    this.interimMessageText.set(message);
    this.interimCountdownSeconds.set(delaySeconds);
    this.interimTotalSeconds.set(delaySeconds);
    this.showInterimOverlay.set(true);

    if (this.interimCountdownInterval) clearInterval(this.interimCountdownInterval);
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
  }

  private onTransactionSuccess(): void {
    this.executing.set(false);
    const hasEstorno = this.estornarChecked() && this.estornoTransacao();
    const hasConciliacao = this.conciliarChecked() && this.conciliacaoTransacao();
    let msg = 'A transação foi disparada com sucesso. Verificar logs';
    if (hasEstorno && hasConciliacao) {
      msg = 'Transação, estorno e conciliação disparados com sucesso. Verificar logs';
    } else if (hasEstorno) {
      msg = 'Transação e estorno disparados com sucesso. Verificar logs';
    } else if (hasConciliacao) {
      msg = 'Transação e conciliação disparadas com sucesso. Verificar logs';
    }
    this.successMessageText.set(msg);
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
  }

  private loadEstornoFields(estornoItem: TransacaoItem): void {
    this.estornoLoading.set(true);
    const bit90Value = this.computeBit90();
    this.estornoBit90.set(bit90Value);

    this.isoParserService
      .parseIso(estornoItem.message, estornoItem.messageModel, estornoItem.paymentNetwork, estornoItem.messageType)
      .pipe(
        switchMap((parsed) => {
          const updatedFields = { ...parsed.fields, '90': bit90Value };
          const estornoMti = parsed.mti || '0400';
          return this.isoParserService
            .buildIso(estornoMti, updatedFields, estornoItem.messageModel, estornoItem.paymentNetwork, estornoItem.messageType)
            .pipe(
              switchMap((built) => {
                this.estornoIsoMessage.set(built.message);
                return this.isoParserService.parseIso(
                  built.message,
                  estornoItem.messageModel,
                  estornoItem.paymentNetwork,
                  estornoItem.messageType,
                );
              }),
            );
        }),
      )
      .subscribe({
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
          this.notif.error('Erro ao carregar campos do estorno');
        },
      });
  }

  private loadConciliacaoFields(item: TransacaoItem): void {
    this.conciliacaoLoading.set(true);
    this.isoParserService
      .parseIso(item.message, item.messageModel, item.paymentNetwork, item.messageType)
      .subscribe({
        next: (parsed) => {
          this.conciliacaoLoading.set(false);
          this.conciliacaoMti.set(parsed.mti || '');
          this.conciliacaoIsoMessage.set(item.message);
          const keys = Object.keys(parsed.fields); // preserve order — CONCILIACAO always has named fields
          this.conciliacaoSortedKeys.set(keys);
          const group: Record<string, FormControl<string>> = {};
          for (const key of keys) {
            group[key] = new FormControl(parsed.fields[key], { nonNullable: true });
          }
          this.conciliacaoBitsForm.set(new FormGroup(group));
        },
        error: () => {
          this.conciliacaoLoading.set(false);
          this.notif.error('Erro ao carregar campos da conciliação');
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

  private resetConciliacaoFields(): void {
    this.conciliacaoMti.set('');
    this.conciliacaoSortedKeys.set([]);
    this.conciliacaoBitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.conciliacaoIsoMessage.set('');
  }

  private rebuildEstornoIsoIfNeeded(): Observable<unknown> {
    const estorno = this.estornoTransacao();
    if (!this.estornarChecked() || !estorno || this.estornoSortedKeys().length === 0) {
      return of(null);
    }

    const estornoForm = this.estornoBitsForm();
    const estornoFields: Record<string, string> = {};
    for (const key of this.estornoSortedKeys()) {
      estornoFields[key] = estornoForm.controls[key]?.value ?? '';
    }

    return this.isoParserService
      .buildIso(this.estornoMti() || '0400', estornoFields, estorno.messageModel, estorno.paymentNetwork, estorno.messageType)
      .pipe(tap((built) => this.estornoIsoMessage.set(built.message)));
  }

  private rebuildConciliacaoIsoIfNeeded(): Observable<unknown> {
    const conciliacao = this.conciliacaoTransacao();
    if (!this.conciliarChecked() || !conciliacao || this.conciliacaoSortedKeys().length === 0) {
      return of(null);
    }

    const conciliacaoForm = this.conciliacaoBitsForm();
    const conciliacaoFields: Record<string, string> = {};
    for (const key of this.conciliacaoSortedKeys()) {
      conciliacaoFields[key] = conciliacaoForm.controls[key]?.value ?? '';
    }

    return this.isoParserService
      .buildIso(this.conciliacaoMti() || 'FREC', conciliacaoFields, conciliacao.messageModel, conciliacao.paymentNetwork, conciliacao.messageType)
      .pipe(tap((built) => this.conciliacaoIsoMessage.set(built.message)));
  }

  private getBuildIsoInputFromRequestForm(): { mti: string; fields: Record<string, string> } {
    const form = this.bitsForm();
    const map: Record<string, string> = {};
    for (const key of this.sortedKeys()) {
      map[key] = form.controls[key]?.value ?? '';
    }
    const mtiValue = map['00'] ?? this.mti() ?? '';
    const fieldsWithoutMti = { ...map };
    delete fieldsWithoutMti['00'];
    return { mti: mtiValue, fields: fieldsWithoutMti };
  }

  private buildBitsForm(map: Record<string, string>, preserveOrder = false): void {
    const keys = preserveOrder
      ? Object.keys(map)
      : Object.keys(map).sort((a, b) => Number(a) - Number(b));
    this.sortedKeys.set(keys);
    const group: Record<string, FormControl<string>> = {};
    for (const key of keys) {
      group[key] = new FormControl(map[key], { nonNullable: true });
    }
    this.bitsForm.set(new FormGroup(group));
  }

  private computeBit90(): string {
    const mainMti = this.mti() || '0000';
    const form = this.bitsForm();
    const bit11Key = this.findFormKey(form, 11) || '11';
    const bit07Key = this.findFormKey(form, 7) || '07';
    const bit11 = form.controls[bit11Key]?.value ?? '000000';
    const bit07 = form.controls[bit07Key]?.value ?? '0000000000';
    return `${mainMti.padStart(4, '0').slice(-4)}${bit11.padStart(6, '0').slice(-6)}${bit07.padStart(10, '0').slice(-10)}`;
  }

  private updateEstornoBit90WithNewBit07(_newBit07: string): void {
    const newBit90 = this.computeBit90();
    this.estornoBit90.set(newBit90);
    const estornoForm = this.estornoBitsForm();
    if (estornoForm.controls['90']) {
      estornoForm.controls['90'].setValue(newBit90);
    }
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

  private findFieldKey(fields: Record<string, string>, bitNum: number): string | null {
    const padded = String(bitNum).padStart(2, '0');
    const unpadded = String(bitNum);
    if (padded in fields) return padded;
    if (unpadded in fields) return unpadded;
    return null;
  }

  private findFormKey(form: FormGroup, bitNum: number): string | null {
    const padded = String(bitNum).padStart(2, '0');
    const unpadded = String(bitNum);
    if (form.controls[padded]) return padded;
    if (form.controls[unpadded]) return unpadded;
    return null;
  }
}
