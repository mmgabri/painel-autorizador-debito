import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SimuladorResponse {
  fields: Record<string, string>;
  message: string;
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

  simular(hexIso: string): Observable<SimuladorResponse> {
    return this.http.post<SimuladorResponse>(`${this.baseUrl}/api/simulador`, {
      message: hexIso,
    });
  }
}
