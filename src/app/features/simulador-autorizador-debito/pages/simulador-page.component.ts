import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { IsoParserService } from '../services/iso-parser.service';

@Component({
  selector: 'app-simulador-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './simulador-page.component.html',
  styleUrl: './simulador-page.component.scss',
})
export class SimuladorPageComponent {
  formIso = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  // Request fields
  bitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  sortedKeys = signal<string[]>([]);
  loading = signal(false);
  parsed = signal(false);

  // Response fields
  responseBitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  responseSortedKeys = signal<string[]>([]);
  responseMessage = signal('');
  loadingTransaction = signal(false);
  transactionDone = signal(false);

  constructor(
    private readonly isoParserService: IsoParserService,
    private readonly snackBar: MatSnackBar,
  ) {}

  onParse(): void {
    if (this.formIso.invalid) {
      return;
    }

    this.loading.set(true);
    const message = this.formIso.controls.message.value ?? '';

    this.isoParserService.parseIso(message).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.parsed.set(true);
        this.buildBitsForm(result);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar campos', 'Fechar', { duration: 5000 });
      },
    });
  }

  onClear(): void {
    this.formIso.reset();
    this.bitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.sortedKeys.set([]);
    this.parsed.set(false);
    this.clearResponse();
  }

  onDispararTransacao(): void {
    const fieldsMap = this.getRequestFieldsMap();
    if (Object.keys(fieldsMap).length === 0) {
      return;
    }

    this.loadingTransaction.set(true);
    this.transactionDone.set(false);

    // Step a: build hex from fields map, then step b: call simulador with hex
    this.isoParserService
      .buildIso(fieldsMap)
      .pipe(switchMap((buildResult) => this.isoParserService.simular(buildResult.message)))
      .subscribe({
        next: (simResult) => {
          this.loadingTransaction.set(false);
          this.transactionDone.set(true);
          this.buildResponseForm(simResult.fields);
          this.responseMessage.set(simResult.message);
        },
        error: () => {
          this.loadingTransaction.set(false);
          this.snackBar.open('Erro ao disparar transação', 'Fechar', { duration: 5000 });
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
  }

  private buildResponseForm(map: Record<string, string>): void {
    const group: Record<string, FormControl<string>> = {};
    const keys = Object.keys(map).sort((a, b) => Number(a) - Number(b));
    this.responseSortedKeys.set(keys);

    for (const key of keys) {
      group[key] = new FormControl({ value: map[key], disabled: true }, { nonNullable: true });
    }

    this.responseBitsForm.set(new FormGroup(group));
  }

  private clearResponse(): void {
    this.responseBitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.responseSortedKeys.set([]);
    this.responseMessage.set('');
    this.transactionDone.set(false);
  }
}
