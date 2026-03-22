import { Component, Input, OnInit, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, delay, of, tap, Observable } from 'rxjs';
import { IsoParserService, TransacaoItem } from '../../services/iso-parser.service';
import { BuscarEstornoDialogComponent } from '../buscar-estorno-dialog.component';

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
  private readonly snackBar = inject(MatSnackBar);
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
  conciliarChecked = signal(false);
  estornoTransacao = signal<TransacaoItem | null>(null);
  estornoDelay = signal(5);
  estornoBit90 = signal('');
  estornoMti = signal('');
  estornoSortedKeys = signal<string[]>([]);
  estornoBitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  estornoIsoMessage = signal('');
  estornoLoading = signal(false);

  // Success overlay
  showSuccessOverlay = signal(false);
  countdownSeconds = signal(3);
  successMessageText = signal('A transação foi disparada com sucesso. Verificar logs');
  private successTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  // Interim overlay
  showInterimOverlay = signal(false);
  interimCountdownSeconds = signal(5);
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
          this.snackBar.open('Erro ao carregar campos da transação', 'Fechar', { duration: 5000 });
        },
      });
  }

  onToggleEstornar(checked: boolean): void {
    this.estornarChecked.set(checked);
    if (checked) {
      const dialogRef = this.dialog.open(BuscarEstornoDialogComponent, { width: '560px' });
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

  onExecutarTransacao(): void {
    const transacao = this.selectedTransacao();
    if (!transacao) return;

    if (this.estornarChecked() && this.estornoTransacao() && this.estornoDelay() < 0) {
      this.snackBar.open('Informe um tempo de espera válido', 'Fechar', { duration: 3000 });
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
        switchMap(() => this.afterMainTransactionExecuted(transacao)),
      )
      .subscribe({
        next: () => this.onTransactionSuccess(),
        error: (err) => {
          console.error('Erro ao executar transação:', err);
          this.executing.set(false);
          this.onFecharInterimOverlay();
          this.snackBar.open('Erro ao executar transação', 'Fechar', { duration: 5000 });
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

    this.isoParserService.excluirTransacao(transacao.id).subscribe({
      next: (result) => {
        this.snackBar.open(result?.message ?? 'Cenário excluído com sucesso', 'Fechar', { duration: 5000 });
        this.excluiu.emit();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir transação', 'Fechar', { duration: 5000 });
      },
    });
  }

  private afterMainTransactionExecuted(_transacao: TransacaoItem): Observable<unknown> {
    const estorno = this.estornoTransacao();
    if (this.estornarChecked() && estorno) {
      const delaySeconds = this.estornoDelay() || 0;
      this.interimMessageText.set('Transação financeira enviada, aguardando para enviar o estorno.');
      this.interimCountdownSeconds.set(delaySeconds);
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

      return of(null).pipe(
        delay(delaySeconds * 1000),
        tap(() => this.onFecharInterimOverlay()),
        switchMap(() => {
          const estornoIso = this.estornoIsoMessage() || estorno.message;
          return this.isoParserService.executarTransacao(estornoIso, estorno.messageModel, estorno.paymentNetwork, estorno.messageType);
        }),
      );
    }
    return of(null);
  }

  private onTransactionSuccess(): void {
    this.executing.set(false);
    this.successMessageText.set(
      this.estornarChecked() && this.estornoTransacao()
        ? 'Transação e estorno disparados com sucesso. Verificar logs'
        : 'A transação foi disparada com sucesso. Verificar logs',
    );
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
    const keys = preserveOrder ? Object.keys(map) : Object.keys(map).sort();
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
