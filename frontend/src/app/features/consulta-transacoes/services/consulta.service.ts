import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConsultaFiltro {
  cartao?: string;
  data?: string;
  hora?: string;
  minuto?: string;
  segundo?: string;
}

export interface ConsultaResultItem {
  correlationId: string;
  nomeProduto: string;
  status: string;
  hora: string;
  valor: string;
  messageRequest: string;
  messageResponse: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  buscarTransacoes(filtro: ConsultaFiltro): Observable<ConsultaResultItem[]> {
    let params = new HttpParams();
    if (filtro.cartao && filtro.cartao.trim() !== '') {
      params = params.set('cartao', filtro.cartao.trim());
    }
    if (filtro.data && filtro.data.trim() !== '') {
      params = params.set('data', filtro.data.trim());
    }
    if (filtro.hora && filtro.hora.trim() !== '') {
      params = params.set('hora', filtro.hora.trim());
    }
    if (filtro.minuto && filtro.minuto.trim() !== '') {
      params = params.set('minuto', filtro.minuto.trim());
    }
    if (filtro.segundo && filtro.segundo.trim() !== '') {
      params = params.set('segundo', filtro.segundo.trim());
    }
    return this.http.get<ConsultaResultItem[]>(`${this.baseUrl}/api/consulta/transacao`, { params });
  }

  buscarDetalhes(correlationId: string): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.baseUrl}/api/consulta/${correlationId}`);
  }

  parseIso(hexIso: string): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(`${this.baseUrl}/api/iso8583/parse`, {
      message: hexIso,
    });
  }
}
