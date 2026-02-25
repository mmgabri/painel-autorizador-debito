import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IsoParserService {
  private readonly url = `${environment.apiBaseUrl}/api/iso8583/parse`;

  constructor(private readonly http: HttpClient) {}

  parseIso(hexIso: string): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(this.url, { message: hexIso });
  }
}
