import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IsoParserService } from './iso-parser.service';
import { environment } from '../../../environments/environment';

describe('IsoParserService', () => {
  let service: IsoParserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IsoParserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call POST /api/iso8583/parse with the correct URL and body', () => {
    const mockResponse: Record<string, string> = {
      '02': '5454545454',
      '03': '0000',
      '04': '000005212',
    };

    service.parseIso('0200ABCDEF').subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/iso8583/parse`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ message: '0200ABCDEF' });
    req.flush(mockResponse);
  });
});
