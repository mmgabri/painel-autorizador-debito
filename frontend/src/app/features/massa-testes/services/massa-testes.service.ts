import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MassaTestesItem {
  id: string;
  paymentNetwork: string;
  messageModel: string;
  tag: string;
  description: string;
  cardNumber: string;
  expiryDate: string;
  cardFunctionalityCode: string;
  firstDigitServiceCode: string;
  situationCode: string;
  statusCode: string;
  technologyCode: string;
  typeCode: string;
  accountId: string;
  agency: string;
  account: string;
  dac: string;
  suffix: string;
  accountType: string;
  accountHolder: string;
  categoryId: string;
  segmentCode: string;
  personTypeCode: string;
  updatedAt: string;
}

export interface SalvarMassaTestesRequest {
  id?: string;
  paymentNetwork: string;
  messageModel: string;
  tag: string;
  description: string;
  cardNumber: string;
  expiryDate: string;
  cardFunctionalityCode: string;
  firstDigitServiceCode: string;
  situationCode: string;
  statusCode: string;
  technologyCode: string;
  typeCode: string;
  accountId: string;
  agency: string;
  account: string;
  dac: string;
  suffix: string;
  accountType: string;
  accountHolder: string;
  categoryId: string;
  segmentCode: string;
  personTypeCode: string;
}

export interface MassaTestesFiltro {
  cardNumber?: string;
  accountId?: string;
  paymentNetwork?: string;
  messageModel?: string;
  tag?: string;
}

@Injectable({ providedIn: 'root' })
export class MassaTestesService {
  private readonly baseUrl = environment.apiBaseUrlJava;

  constructor(private readonly http: HttpClient) {}

  salvar(data: SalvarMassaTestesRequest): Observable<MassaTestesItem> {
    return this.http.post<MassaTestesItem>(`${this.baseUrl}/api/massa-testes/salvar`, data);
  }

  consultar(filtro?: MassaTestesFiltro): Observable<MassaTestesItem[]> {
    let params = new HttpParams();
    if (filtro?.cardNumber) params = params.set('cardNumber', filtro.cardNumber);
    if (filtro?.accountId) params = params.set('accountId', filtro.accountId);
    if (filtro?.paymentNetwork) params = params.set('paymentNetwork', filtro.paymentNetwork);
    if (filtro?.messageModel) params = params.set('messageModel', filtro.messageModel);
    if (filtro?.tag) params = params.set('tag', filtro.tag);
    return this.http.get<MassaTestesItem[]>(`${this.baseUrl}/api/massa-testes`, { params });
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/massa-testes/${id}`);
  }

  carregarDadinho(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/api/massa-testes/${id}/carregar-dadinho`, {});
  }
}
