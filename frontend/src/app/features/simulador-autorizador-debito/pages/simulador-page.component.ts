import { Component, ViewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TransacaoItem } from '../services/iso-parser.service';
import { DispatcherEventoItem } from '../services/dispatcher.service';
import { BuscarCenariosComponent } from '../components/buscar-cenarios/buscar-cenarios.component';
import { ConfigurarCenarioComponent } from '../components/configurar-cenario/configurar-cenario.component';
import { DispararTransacaoComponent } from '../components/disparar-transacao/disparar-transacao.component';
import { BuscarDispatcherComponent } from '../components/buscar-dispatcher/buscar-dispatcher.component';
import { ConfigurarDispatcherComponent } from '../components/configurar-dispatcher/configurar-dispatcher.component';
import { DispararEventoComponent } from '../components/disparar-evento/disparar-evento.component';

@Component({
  selector: 'app-simulador-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    BuscarCenariosComponent,
    ConfigurarCenarioComponent,
    DispararTransacaoComponent,
    BuscarDispatcherComponent,
    ConfigurarDispatcherComponent,
    DispararEventoComponent,
  ],
  templateUrl: './simulador-page.component.html',
  styleUrl: './simulador-page.component.scss',
})
export class SimuladorPageComponent {
  @ViewChild(BuscarCenariosComponent) private buscarRef?: BuscarCenariosComponent;
  @ViewChild(BuscarDispatcherComponent) private buscarDispatcherRef?: BuscarDispatcherComponent;

  activeView = signal<'buscar' | 'incluir' | 'disparar' | 'buscarDispatcher' | 'incluirDispatcher' | 'dispararEvento'>('buscar');
  cenarioSelecionado = signal<TransacaoItem | null>(null);
  cenarioParaEditar = signal<TransacaoItem | null>(null);

  eventoSelecionado = signal<DispatcherEventoItem | null>(null);
  eventoParaEditar = signal<DispatcherEventoItem | null>(null);

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

  // Dispatcher
  onIrParaBuscarDispatcher(): void {
    const wasAlready = this.activeView() === 'buscarDispatcher';
    this.eventoParaEditar.set(null);
    this.activeView.set('buscarDispatcher');
    if (wasAlready) {
      this.buscarDispatcherRef?.carregar();
    }
  }

  onIrParaIncluirDispatcher(): void {
    this.eventoParaEditar.set(null);
    this.activeView.set('incluirDispatcher');
  }

  onSelecionouEvento(evento: DispatcherEventoItem): void {
    this.eventoSelecionado.set(evento);
    this.activeView.set('dispararEvento');
  }

  onEditouEvento(evento: DispatcherEventoItem): void {
    this.eventoParaEditar.set(evento);
    this.activeView.set('incluirDispatcher');
  }

  onDispararFromConfigurarDispatcher(evento: DispatcherEventoItem): void {
    this.eventoSelecionado.set(evento);
    this.activeView.set('dispararEvento');
  }

  onVoltouDoDispararEvento(): void {
    this.activeView.set('buscarDispatcher');
  }

  onExcluiuDoDispararEvento(): void {
    this.activeView.set('buscarDispatcher');
  }
}
