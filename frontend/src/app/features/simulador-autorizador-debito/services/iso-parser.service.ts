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
  productName: string;
  tag: string;
  description: string;
  isoMessage: string;
  messageModel: string;
  messageType: string;
  paymentNetwork: string;
}

export interface SalvarTransacaoResponse {
  id: string;
  isoMessage: string;
}

export interface TransacaoItem {
  id: string;
  productName: string;
  tag: string;
  description: string;
  isoMessage: string;
  messageModel: string;
  messageType: string;
  paymentNetwork: string;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class IsoParserService {
  private readonly baseUrl = environment.apiBaseUrlJava;

  constructor(private readonly http: HttpClient) {}

  parseIso(hexIso: string, messageModel?: string, paymentNetwork?: string, messageType?: string): Observable<IsoParseResponse> {
    const body: Record<string, string> = { message: hexIso };
    if (messageModel) body['messageModel'] = messageModel;
    if (paymentNetwork) body['paymentNetwork'] = paymentNetwork;
    if (messageType) body['messageType'] = messageType;
    return this.http.post<IsoParseResponse>(`${this.baseUrl}/api/simulador/message/parse`, body);
  }

  buildIso(mti: string, fields: Record<string, string>, messageModel?: string, paymentNetwork?: string, messageType?: string): Observable<{ isoMessage: string }> {
    const body: Record<string, unknown> = { mti, fields };
    if (messageModel) body['messageModel'] = messageModel;
    if (paymentNetwork) body['paymentNetwork'] = paymentNetwork;
    if (messageType) body['messageType'] = messageType;
    return this.http.post<{ isoMessage: string }>(`${this.baseUrl}/api/simulador/message/build`, body);
  }

  salvarTransacao(data: SalvarTransacaoRequest): Observable<SalvarTransacaoResponse> {
    return this.http.post<SalvarTransacaoResponse>(`${this.baseUrl}/api/simulador/cenarios/salvar`, data);
  }

  consultarTransacoes(productName?: string, tag?: string, paymentNetwork?: string, messageType?: string): Observable<TransacaoItem[]> {
    let params = new HttpParams();
    if (productName && productName.trim() !== '') {
      params = params.set('productName', productName.trim());
    }
    if (tag && tag.trim() !== '') {
      params = params.set('tag', tag.trim());
    }
    if (paymentNetwork && paymentNetwork.trim() !== '') {
      params = params.set('paymentNetwork', paymentNetwork.trim());
    }
    if (messageType && messageType.trim() !== '') {
      params = params.set('messageType', messageType.trim());
    }
    return this.http.get<TransacaoItem[]>(`${this.baseUrl}/api/simulador/cenarios`, { params });
  }

  excluirTransacao(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/api/simulador/cenarios/${id}`);
  }

  executarTransacao(isoMessage: string, messageModel?: string, paymentNetwork?: string, messageType?: string): Observable<{ message: string }> {
    const body: Record<string, string> = { isoMessage };
    if (messageModel) body['messageModel'] = messageModel;
    if (paymentNetwork) body['paymentNetwork'] = paymentNetwork;
    if (messageType) body['messageType'] = messageType;
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/api/simulador/cenarios/executar`,
      body,
    );
  }
}
