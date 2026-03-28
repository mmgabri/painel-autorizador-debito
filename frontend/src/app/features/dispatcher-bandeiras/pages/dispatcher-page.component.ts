import { Component, ViewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DispatcherEventoItem } from '../services/dispatcher.service';
import { BuscarDispatcherComponent } from '../components/buscar-dispatcher/buscar-dispatcher.component';
import { ConfigurarDispatcherComponent } from '../components/configurar-dispatcher/configurar-dispatcher.component';
import { DispararEventoComponent } from '../components/disparar-evento/disparar-evento.component';

@Component({
  selector: 'app-dispatcher-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    BuscarDispatcherComponent,
    ConfigurarDispatcherComponent,
    DispararEventoComponent,
  ],
  templateUrl: './dispatcher-page.component.html',
  styleUrl: './dispatcher-page.component.scss',
})
export class DispatcherPageComponent {
  @ViewChild(BuscarDispatcherComponent) private buscarDispatcherRef?: BuscarDispatcherComponent;

  activeView = signal<'buscarDispatcher' | 'incluirDispatcher' | 'dispararEvento'>('buscarDispatcher');
  eventoSelecionado = signal<DispatcherEventoItem | null>(null);
  eventoParaEditar = signal<DispatcherEventoItem | null>(null);

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
