import { Component, signal, inject, output, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IsoParserService, TransacaoItem } from '../../services/iso-parser.service';

@Component({
  selector: 'app-buscar-cenarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './buscar-cenarios.component.html',
  styleUrl: './buscar-cenarios.component.scss',
})
export class BuscarCenariosComponent implements OnInit {
  private readonly isoParserService = inject(IsoParserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly selecionou = output<TransacaoItem>();
  readonly editou = output<TransacaoItem>();

  filtroNome = '';
  filtroTag = '';
  filtroBandeira = '';
  loading = signal(false);
  transacoes = signal<TransacaoItem[]>([]);

  readonly bandeiraOptions = ['MASTERCARD', 'VISA'];

  ngOnInit(): void {
    this.carregar();
  }

  onFiltrar(): void {
    this.carregar(this.filtroNome, this.filtroTag, this.filtroBandeira);
  }

  onSelecionar(item: TransacaoItem): void {
    this.selecionou.emit(item);
  }

  onEditar(item: TransacaoItem): void {
    this.editou.emit(item);
  }

  onExcluir(item: TransacaoItem): void {
    this.isoParserService.excluirTransacao(item.id).subscribe({
      next: (result) => {
        this.snackBar.open(result?.message ?? 'Cenário excluído com sucesso', 'Fechar', { duration: 5000 });
        this.transacoes.set(this.transacoes().filter((t) => t.id !== item.id));
      },
      error: () => {
        this.snackBar.open('Erro ao excluir cenário', 'Fechar', { duration: 5000 });
      },
    });
  }

  carregar(nomeProduto?: string, tag?: string, bandeira?: string): void {
    this.loading.set(true);
    this.isoParserService.consultarTransacoes(nomeProduto, tag, bandeira).subscribe({
      next: (list) => {
        this.loading.set(false);
        this.transacoes.set(list);
      },
      error: () => {
        this.loading.set(false);
        this.transacoes.set([]);
      },
    });
  }
}
