import { Component, ViewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MassaTestesItem } from '../services/massa-testes.service';
import { PesquisarMassaComponent } from '../components/pesquisar-massa/pesquisar-massa.component';
import { ConfigurarMassaComponent } from '../components/configurar-massa/configurar-massa.component';

@Component({
  selector: 'app-massa-testes-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, PesquisarMassaComponent, ConfigurarMassaComponent],
  templateUrl: './massa-testes-page.component.html',
  styleUrl: './massa-testes-page.component.scss',
})
export class MassaTestesPageComponent {
  @ViewChild(PesquisarMassaComponent) private pesquisarRef?: PesquisarMassaComponent;

  activeView = signal<'pesquisar' | 'configurar'>('pesquisar');
  massaParaEditar = signal<MassaTestesItem | null>(null);

  onIrParaPesquisar(): void {
    const wasAlready = this.activeView() === 'pesquisar';
    this.massaParaEditar.set(null);
    this.activeView.set('pesquisar');
    if (wasAlready) {
      this.pesquisarRef?.carregar();
    }
  }

  onIrParaConfigurar(): void {
    this.massaParaEditar.set(null);
    this.activeView.set('configurar');
  }

  onEditou(massa: MassaTestesItem): void {
    this.massaParaEditar.set(massa);
    this.activeView.set('configurar');
  }
}
