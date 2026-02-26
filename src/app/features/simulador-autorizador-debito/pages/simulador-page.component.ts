import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './simulador-page.component.html',
  styleUrl: './simulador-page.component.scss',
})
export class SimuladorPageComponent {
  // Active view: 'main' | 'incluir'
  activeView = signal<'main' | 'incluir'>('main');

  // Incluir transacao form
  incluirForm = new FormGroup({
    nomeProduto: new FormControl('', [Validators.required]),
    descricao: new FormControl(''),
    message: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  // Request fields
  bitsForm = signal(new FormGroup<Record<string, FormControl<string>>>({}));
  sortedKeys = signal<string[]>([]);
  loading = signal(false);

  // Save state
  saving = signal(false);

  // Available bits for "Incluir campo" (2-128, excluding already added)
  availableBits = signal<number[]>([]);

  constructor(
    private readonly isoParserService: IsoParserService,
    private readonly snackBar: MatSnackBar,
  ) {}

  onIncluirTransacao(): void {
    this.activeView.set('incluir');
    this.incluirForm.reset();
    this.bitsForm.set(new FormGroup<Record<string, FormControl<string>>>({}));
    this.sortedKeys.set([]);
    this.updateAvailableBits();
  }

  onVoltarMain(): void {
    this.activeView.set('main');
  }

  onCarregarCampos(): void {
    const message = this.incluirForm.controls.message.value ?? '';
    if (!message || message.trim().length < 4) {
      this.snackBar.open('Informe a mensagem ISO com no mínimo 4 caracteres', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    this.loading.set(true);

    this.isoParserService.parseIso(message).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.buildBitsForm(result);
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
      .buildIso(fieldsMap)
      .pipe(
        switchMap((buildResult) => {
          this.incluirForm.controls.message.setValue(buildResult.message);

          return this.isoParserService.salvarTransacao({
            nomeProduto: nomeProduto.trim(),
            descricao: (this.incluirForm.controls.descricao.value ?? '').trim(),
            mensagemIso: buildResult.message,
          });
        }),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Transação incluída com sucesso!', 'Fechar', { duration: 5000 });
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Erro ao salvar transação', 'Fechar', { duration: 5000 });
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
}
