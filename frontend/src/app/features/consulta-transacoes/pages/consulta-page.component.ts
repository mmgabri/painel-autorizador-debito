import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-consulta-page',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './consulta-page.component.html',
  styleUrl: './consulta-page.component.scss',
})
export class ConsultaPageComponent {}
