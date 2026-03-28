import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MassaTestesItem {
  id: string;
  bandeira: string;
  modeloMensagem: string;
  tag: string;
  descricao: string;
  cartao: string;
  dataVencimento: string;
  codigoFuncionalidadeCartao: string;
  codigoServicoPrimeiroDigito: string;
  codigoSituacao: string;
  codigoStatus: string;
  codigoTecnologia: string;
  codigoTipo: string;
  idConta: string;
  agencia: string;
  conta: string;
  dac: string;
  sufixo: string;
  tipoConta: string;
  titular: string;
  idCategoria: string;
  codigoSegmento: string;
  codigoTipoPessoa: string;
  updatedAt: string;
}

export interface SalvarMassaTestesRequest {
  id?: string;
  bandeira: string;
  modeloMensagem: string;
  tag: string;
  descricao: string;
  cartao: string;
  dataVencimento: string;
  codigoFuncionalidadeCartao: string;
  codigoServicoPrimeiroDigito: string;
  codigoSituacao: string;
  codigoStatus: string;
  codigoTecnologia: string;
  codigoTipo: string;
  idConta: string;
  agencia: string;
  conta: string;
  dac: string;
  sufixo: string;
  tipoConta: string;
  titular: string;
  idCategoria: string;
  codigoSegmento: string;
  codigoTipoPessoa: string;
}

export interface MassaTestesFiltro {
  cartao?: string;
  idConta?: string;
  bandeira?: string;
  modeloMensagem?: string;
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
    if (filtro?.cartao) params = params.set('cartao', filtro.cartao);
    if (filtro?.idConta) params = params.set('idConta', filtro.idConta);
    if (filtro?.bandeira) params = params.set('bandeira', filtro.bandeira);
    if (filtro?.modeloMensagem) params = params.set('modeloMensagem', filtro.modeloMensagem);
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
