import { Component, ViewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TransacaoItem } from '../services/iso-parser.service';
import { BuscarCenariosComponent } from '../components/buscar-cenarios/buscar-cenarios.component';
import { ConfigurarCenarioComponent } from '../components/configurar-cenario/configurar-cenario.component';
import { DispararTransacaoComponent } from '../components/disparar-transacao/disparar-transacao.component';

@Component({
  selector: 'app-simulador-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    BuscarCenariosComponent,
    ConfigurarCenarioComponent,
    DispararTransacaoComponent,
  ],
  templateUrl: './simulador-page.component.html',
  styleUrl: './simulador-page.component.scss',
})
export class SimuladorPageComponent {
  @ViewChild(BuscarCenariosComponent) private buscarRef?: BuscarCenariosComponent;

  activeView = signal<'buscar' | 'incluir' | 'disparar'>('buscar');
  cenarioSelecionado = signal<TransacaoItem | null>(null);
  cenarioParaEditar = signal<TransacaoItem | null>(null);

  onIrParaBuscar(): void {
    const wasAlreadyOnBuscar = this.activeView() === 'buscar';
    this.cenarioParaEditar.set(null);
    this.activeView.set('buscar');
    if (wasAlreadyOnBuscar) {
      this.buscarRef?.carregar();
    }
  }

  onIrParaIncluir(): void {
    this.cenarioParaEditar.set(null);
    this.activeView.set('incluir');
  }

  onSelecionouCenario(cenario: TransacaoItem): void {
    this.cenarioSelecionado.set(cenario);
    this.activeView.set('disparar');
  }

  onEditouCenario(cenario: TransacaoItem): void {
    this.cenarioParaEditar.set(cenario);
    this.activeView.set('incluir');
  }

  onDispararFromConfigurar(cenario: TransacaoItem): void {
    this.cenarioSelecionado.set(cenario);
    this.activeView.set('disparar');
  }

  onVoltouDoDisparar(): void {
    this.activeView.set('buscar');
  }

  onExcluiuDoDisparar(): void {
    this.activeView.set('buscar');
  }
}
