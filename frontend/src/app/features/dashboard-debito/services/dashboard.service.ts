import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AcumuladoDia {
  data: string;
  ultima_atualizacao: string;
  volume: number;
  faturamento: number;
  pico_hora_volume: number;
  pico_hora_volume_faixa: string;
  pico_hora_faturamento: number;
  pico_hora_faturamento_faixa: string;
  tps_atual: number;
  tps_atual_hora: string;
  pico_dia: number;
  pico_dia_hora: string;
}

export interface AcumuladoA1 {
  data: string;
  volume: number;
  faturamento: number;
  pico_hora_volume: number;
  pico_hora_volume_faixa: string;
  pico_hora_faturamento: number;
  pico_hora_faturamento_faixa: string;
  pico_dia: number;
  pico_dia_hora: string;
}

export interface Recorde {
  record_volume: number;
  record_volume_data: string;
  record_faturamento: number;
  record_faturamento_data: string;
  record_pico_hora_volume: number;
  record_pico_hora_volume_data: string;
  record_pico_hora_volume_faixa: string;
  record_pico_hora_faturamento: number;
  record_pico_hora_faturamento_data: string;
  record_pico_hora_faturamento_faixa: string;
  record_tps: number;
  record_tps_data: string;
  record_tps_hora: string;
}

export interface AcumuladoSemanaItem {
  data: string;
  dia_semana: string;
  volume: number;
  faturamento: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getAcumuladoDia(data: string): Observable<AcumuladoDia> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AcumuladoDia>(`${this.baseUrl}/api/dashboard/acumulado-dia`, { params });
  }

  getAcumuladoA1(data: string): Observable<AcumuladoA1> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AcumuladoA1>(`${this.baseUrl}/api/dashboard/acumulado-a1`, { params });
  }

  getRecorde(): Observable<Recorde> {
    return this.http.get<Recorde>(`${this.baseUrl}/api/dashboard/recorde`);
  }

  getAcumuladoSemana(data: string): Observable<AcumuladoSemanaItem[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<AcumuladoSemanaItem[]>(`${this.baseUrl}/api/dashboard/acumulado-semana`, { params });
  }
}
