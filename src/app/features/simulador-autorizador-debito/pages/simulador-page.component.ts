import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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

  bitsForm = new FormGroup<Record<string, FormControl<string>>>({});
  sortedKeys: string[] = [];
  loading = false;
  parsed = false;

  constructor(
    private readonly isoParserService: IsoParserService,
    private readonly snackBar: MatSnackBar,
  ) {}

  onParse(): void {
    if (this.formIso.invalid) {
      return;
    }

    this.loading = true;
    const message = this.formIso.controls.message.value ?? '';

    this.isoParserService.parseIso(message).subscribe({
      next: (result) => {
        this.loading = false;
        this.parsed = true;
        this.buildBitsForm(result);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao parsear ISO', 'Fechar', { duration: 5000 });
      },
    });
  }

  onClear(): void {
    this.formIso.reset();
    this.bitsForm = new FormGroup<Record<string, FormControl<string>>>({});
    this.sortedKeys = [];
    this.parsed = false;
  }

  private buildBitsForm(map: Record<string, string>): void {
    const group: Record<string, FormControl<string>> = {};
    this.sortedKeys = Object.keys(map).sort((a, b) => Number(a) - Number(b));

    for (const key of this.sortedKeys) {
      group[key] = new FormControl(map[key], { nonNullable: true });
    }

    this.bitsForm = new FormGroup(group);
  }
}
