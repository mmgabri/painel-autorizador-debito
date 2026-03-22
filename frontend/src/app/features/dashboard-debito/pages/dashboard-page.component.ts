import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../core/services/notification.service';
import {
  DashboardService,
  AcumuladoDia,
  AcumuladoA1,
  Recorde,
  AcumuladoSemanaItem,
} from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  // Date controls
  dataDiaControl = new FormControl(new Date());
  dataA1Control = new FormControl(new Date(Date.now() - 86400000)); // yesterday

  // Loading states
  loadingDia = signal(false);
  loadingA1 = signal(false);
  loadingRecorde = signal(false);
  loadingSemana = signal(false);

  // Data signals
  acumuladoDia = signal<AcumuladoDia | null>(null);
  acumuladoA1 = signal<AcumuladoA1 | null>(null);
  recorde = signal<Recorde | null>(null);
  acumuladoSemana = signal<AcumuladoSemanaItem[]>([]);

  // Computed trend percentages
  tendenciaVolumePct = computed(() => {
    const dia = this.acumuladoDia();
    const a1 = this.acumuladoA1();
    if (!dia || !a1 || a1.volume === 0) return null;
    return ((dia.volume - a1.volume) / a1.volume) * 100;
  });

  tendenciaFaturamentoPct = computed(() => {
    const dia = this.acumuladoDia();
    const a1 = this.acumuladoA1();
    if (!dia || !a1 || a1.faturamento === 0) return null;
    return ((dia.faturamento - a1.faturamento) / a1.faturamento) * 100;
  });

  private readonly notif = inject(NotificationService);

  constructor(private readonly dashboardService: DashboardService) {}

  // ─── Load actions ───

  onLoadAcumuladoDia(): void {
    const date = this.dataDiaControl.value;
    if (!date) return;
    const dataStr = this.formatDate(date);

    this.loadingDia.set(true);
    this.dashboardService.getAcumuladoDia(dataStr).subscribe({
      next: (result) => {
        this.loadingDia.set(false);
        this.acumuladoDia.set(result);
      },
      error: () => {
        this.loadingDia.set(false);
        this.notif.error('Erro ao carregar Acumulado do Dia');
      },
    });
  }

  onLoadAcumuladoA1(): void {
    const date = this.dataA1Control.value;
    if (!date) return;
    const dataStr = this.formatDate(date);

    this.loadingA1.set(true);
    this.dashboardService.getAcumuladoA1(dataStr).subscribe({
      next: (result) => {
        this.loadingA1.set(false);
        this.acumuladoA1.set(result);
      },
      error: () => {
        this.loadingA1.set(false);
        this.notif.error('Erro ao carregar Acumulado A-1');
      },
    });
  }

  onLoadRecorde(): void {
    this.loadingRecorde.set(true);
    this.dashboardService.getRecorde().subscribe({
      next: (result) => {
        this.loadingRecorde.set(false);
        this.recorde.set(result);
      },
      error: () => {
        this.loadingRecorde.set(false);
        this.notif.error('Erro ao carregar Recordes');
      },
    });
  }

  onLoadAcumuladoSemana(): void {
    const date = this.dataDiaControl.value;
    const dataStr = date ? this.formatDate(date) : new Date().toISOString().slice(0, 10);

    this.loadingSemana.set(true);
    this.dashboardService.getAcumuladoSemana(dataStr).subscribe({
      next: (result) => {
        this.loadingSemana.set(false);
        this.acumuladoSemana.set(result);
      },
      error: () => {
        this.loadingSemana.set(false);
        this.notif.error('Erro ao carregar Acumulado da Semana');
      },
    });
  }

  // ─── Format helpers ───

  formatVolume(value: number | undefined | null): string {
    if (value === undefined || value === null) return '—';
    if (value >= 1_000_000) {
      const mi = value / 1_000_000;
      return `${this.formatMi(mi)} MI`;
    }
    return this.formatIntDot(value);
  }

  formatMoney(value: number | undefined | null): string {
    if (value === undefined || value === null) return '—';
    const mi = value / 1_000_000;
    return `R$ ${this.formatMi(mi)} MI`;
  }

  formatTrend(pct: number | null): string {
    if (pct === null) return 'Tendência: —';
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(pct);
    if (pct > 0) return `Tendência: ${formatted}% ▲`;
    if (pct < 0) return `Tendência: ${formatted}% ▼`;
    return `Tendência: ${formatted}% ■`;
  }

  trendClass(pct: number | null): string {
    if (pct === null) return 'trend-flat';
    if (pct > 0) return 'trend-up';
    if (pct < 0) return 'trend-down';
    return 'trend-flat';
  }

  // ─── Private helpers ───

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatIntDot(n: number): string {
    const s = String(Math.trunc(n));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private formatMi(valueInMi: number): string {
    const rounded = Math.round(valueInMi * 1000) / 1000;
    const [intPart, fracPart] = rounded.toFixed(3).split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInt}.${fracPart}`;
  }
}
