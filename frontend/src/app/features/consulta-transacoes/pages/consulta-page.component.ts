import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { ConsultaService, ConsultaResultItem, ConsultaFiltro } from '../services/consulta.service';
import { IsoMessageDialogComponent, IsoMessageDialogData } from '../components/iso-message-dialog.component';
import { DetalhesTransacaoDialogComponent, DetalhesTransacaoDialogData } from '../components/detalhes-transacao-dialog.component';

@Component({
  selector: 'app-consulta-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
  ],
  templateUrl: './consulta-page.component.html',
  styleUrl: './consulta-page.component.scss',
})
export class ConsultaPageComponent {
  private readonly consultaService = inject(ConsultaService);
  private readonly dialog = inject(MatDialog);
  private readonly notif = inject(NotificationService);

  // Filter controls
  cartaoControl = new FormControl('', { validators: [Validators.required] });
  dataControl = new FormControl<Date | null>(null, { validators: [Validators.required] });
  horaControl = new FormControl('');
  minutoControl = new FormControl('');
  segundoControl = new FormControl('');

  // State
  loading = signal(false);
  searched = signal(false);
  resultados = signal<ConsultaResultItem[]>([]);

  // Table columns
  displayedColumns = ['nomeProduto', 'status' , 'codigoRetorno', 'hora', 'correlationId', 'valor', 'messageRequest', 'messageResponse', 'detalhes'];

  onBuscar(): void {
    this.cartaoControl.markAsTouched();
    this.dataControl.markAsTouched();

    if (this.cartaoControl.invalid || this.dataControl.invalid) {
      return;
    }

    this.loading.set(true);
    this.searched.set(true);
    this.resultados.set([]);

    const filtro: ConsultaFiltro = {};

    if (this.cartaoControl.value) {
      filtro.cartao = this.cartaoControl.value;
    }
    if (this.dataControl.value) {
      const d = this.dataControl.value;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      filtro.data = `${year}-${month}-${day}`;
    }
    if (this.horaControl.value) {
      filtro.hora = this.horaControl.value;
    }
    if (this.minutoControl.value) {
      filtro.minuto = this.minutoControl.value;
    }
    if (this.segundoControl.value) {
      filtro.segundo = this.segundoControl.value;
    }

    this.consultaService.buscarTransacoes(filtro).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.resultados.set(result);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onViewIso(title: string, hexMessage: string): void {
    this.consultaService.parseIso(hexMessage).subscribe({
      next: (fields) => {
        this.dialog.open(IsoMessageDialogComponent, {
          width: '500px',
          data: { title, fields, loading: false, rawMessage: hexMessage } as IsoMessageDialogData,
        });
      },
      error: () => {},
    });
  }

  onViewDetalhes(correlationId: string): void {
    this.consultaService.buscarDetalhes(correlationId).subscribe({
      next: (detalhes) => {
        this.dialog.open(DetalhesTransacaoDialogComponent, {
          width: '550px',
          data: { detalhes } as DetalhesTransacaoDialogData,
        });
      },
      error: () => {},
    });
  }
}
