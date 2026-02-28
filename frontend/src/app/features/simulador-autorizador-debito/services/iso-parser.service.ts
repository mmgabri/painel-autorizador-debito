import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SimuladorResponse {
  fields: Record<string, string>;
  message: string;
}

export interface SalvarTransacaoRequest {
  id?: string;
  nomeProduto: string;
  tag: string;
  descricao: string;
  mensagemIso: string;
}

export interface SalvarTransacaoResponse {
  id: string;
  message: string;
}

export interface TransacaoItem {
  id: string;
  nomeProduto: string;
  tag: string;
  descricao: string;
  mensagemIso: string;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class IsoParserService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  parseIso(hexIso: string): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(`${this.baseUrl}/api/iso8583/parse`, {
      message: hexIso,
    });
  }

  buildIso(fields: Record<string, string>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/api/iso8583/build`, fields);
  }

  executarTransacao(hexIso: string): Observable<SimuladorResponse> {
    return this.http.post<SimuladorResponse>(`${this.baseUrl}/api/transacao/executar`, {
      message: hexIso,
    });
  }

  salvarTransacao(data: SalvarTransacaoRequest): Observable<SalvarTransacaoResponse> {
    return this.http.post<SalvarTransacaoResponse>(`${this.baseUrl}/api/transacao/salvar`, data);
  }

  consultarTransacoes(nomeProduto?: string, tag?: string): Observable<TransacaoItem[]> {
    let params = new HttpParams();
    if (nomeProduto && nomeProduto.trim() !== '') {
      params = params.set('nomeProduto', nomeProduto.trim());
    }
    if (tag && tag.trim() !== '') {
      params = params.set('tag', tag.trim());
    }
    return this.http.get<TransacaoItem[]>(`${this.baseUrl}/api/transacao/consultar`, { params });
  }

  excluirTransacao(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/transacao/excluir/${id}`);
  }
}
