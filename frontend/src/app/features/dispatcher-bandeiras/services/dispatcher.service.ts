import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DispatcherEventoItem {
  id: string;
  productName: string;
  targetMicroservice: string;
  tag: string;
  description: string;
  message: string;
  messageModel: string;
  messageType: string;
  paymentNetwork: string;
  updatedAt: string;
}

export interface SalvarDispatcherEventoRequest {
  id?: string;
  productName: string;
  targetMicroservice: string;
  tag: string;
  description: string;
  message: string;
  messageModel: string;
  messageType: string;
  paymentNetwork: string;
}

export interface DispatcherEventoFiltro {
  productName?: string;
  targetMicroservice?: string;
  tag?: string;
  paymentNetwork?: string;
  messageType?: string;
}

export interface DispatcherEventoStage {
  duration: number;
  tps: number;
}

export interface ExecutarDispatcherEventoRequest {
  id?: string;
  productName?: string;
  targetMicroservice?: string;
  messageModel?: string;
  messageType?: string;
  paymentNetwork?: string;
  tag?: string;
  description?: string;
  message?: string;
  stages: DispatcherEventoStage[];
}

@Injectable({ providedIn: 'root' })
export class DispatcherService {
  private readonly baseUrl = environment.apiBaseUrlJava;

  constructor(private readonly http: HttpClient) {}

  salvarEvento(data: SalvarDispatcherEventoRequest): Observable<DispatcherEventoItem> {
    return this.http.post<DispatcherEventoItem>(`${this.baseUrl}/api/dispatcher/eventos/salvar`, data);
  }

  consultarEventos(filtro?: DispatcherEventoFiltro): Observable<DispatcherEventoItem[]> {
    return this.http.post<DispatcherEventoItem[]>(`${this.baseUrl}/api/dispatcher/eventos`, filtro ?? {});
  }

  excluirEvento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/dispatcher/eventos/${id}`);
  }

  executarEvento(request: ExecutarDispatcherEventoRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/api/dispatcher/eventos/executar`, request);
  }
}
