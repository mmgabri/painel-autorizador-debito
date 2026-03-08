import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IsoParseResponse {
  mti: string;
  fields: Record<string, string>;
}

export interface SimuladorResponse {
  fields: Record<string, string>;
  message: string;
}

export interface SalvarTransacaoRequest {
  id?: string;
  nomeProduto: string;
  tag: string;
  descricao: string;
  isoMessage: string;
  messageModel: string;
  bandeira: string;
}

export interface SalvarTransacaoResponse {
  id: string;
  isoMessage: string;
}

export interface TransacaoItem {
  id: string;
  nomeProduto: string;
  tag: string;
  descricao: string;
  isoMessage: string;
  messageModel: string;
  bandeira: string;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class IsoParserService {
  private readonly baseUrl = environment.apiBaseUrlJava;

  constructor(private readonly http: HttpClient) {}

  parseIso(hexIso: string, messageModel?: string, bandeira?: string): Observable<IsoParseResponse> {
    const body: Record<string, string> = { isoMessage: hexIso };
    if (messageModel) body['messageModel'] = messageModel;
    if (bandeira) body['bandeira'] = bandeira;
    return this.http.post<IsoParseResponse>(`${this.baseUrl}/api/simulador/iso/parse`, body);
  }

  buildIso(mti: string, fields: Record<string, string>, messageModel?: string, bandeira?: string): Observable<{ isoMessage: string }> {
    const body: Record<string, unknown> = { mti, fields };
    if (messageModel) body['messageModel'] = messageModel;
    if (bandeira) body['bandeira'] = bandeira;
    return this.http.post<{ isoMessage: string }>(`${this.baseUrl}/api/simulador/iso/build`, body);
  }

  salvarTransacao(data: SalvarTransacaoRequest): Observable<SalvarTransacaoResponse> {
    return this.http.post<SalvarTransacaoResponse>(`${this.baseUrl}/api/simulador/cenarios/salvar`, data);
  }

  consultarTransacoes(nomeProduto?: string, tag?: string, bandeira?: string): Observable<TransacaoItem[]> {
    let params = new HttpParams();
    if (nomeProduto && nomeProduto.trim() !== '') {
      params = params.set('nomeProduto', nomeProduto.trim());
    }
    if (tag && tag.trim() !== '') {
      params = params.set('tag', tag.trim());
    }
    if (bandeira && bandeira.trim() !== '') {
      params = params.set('bandeira', bandeira.trim());
    }
    return this.http.get<TransacaoItem[]>(`${this.baseUrl}/api/simulador/cenarios`, { params });
  }

  excluirTransacao(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/simulador/cenarios/${id}`);
  }

  executarTransacao(isoMessage: string, messageModel?: string, bandeira?: string): Observable<{ message: string }> {
    const body: Record<string, string> = { isoMessage };
    if (messageModel) body['messageModel'] = messageModel;
    if (bandeira) body['bandeira'] = bandeira;
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/api/simulador/cenarios/executar`,
      body,
    );
  }
}
