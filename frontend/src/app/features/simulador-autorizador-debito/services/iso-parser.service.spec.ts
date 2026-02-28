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

  it('should call POST /api/transacao/salvar with the correct URL and body', () => {
    const mockResponse = { id: 'abc-123', message: 'Transação salva com sucesso' };
    const payload = {
      nomeProduto: 'Produto Teste',
      tag: 'TAG1',
      descricao: 'Descrição',
      mensagemIso: '0200AABBCC',
    };

    service.salvarTransacao(payload).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/transacao/salvar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should call POST /api/transacao/executar with the correct URL and body', () => {
    const mockResponse = {
      fields: { '02': '5454545454', '39': '00' },
      message: 'Transação autorizada com sucesso',
    };

    service.executarTransacao('0200AABBCC').subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/transacao/executar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ message: '0200AABBCC' });
    req.flush(mockResponse);
  });

  it('should call GET /api/transacao/consultar without filter', () => {
    const mockList = [
      { id: '1', nomeProduto: 'Prod1', tag: 'TAG1', descricao: 'Desc1', mensagemIso: '0200AA', criadoEm: '' },
    ];

    service.consultarTransacoes().subscribe((result) => {
      expect(result).toEqual(mockList);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/transacao/consultar`);
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('should call DELETE /api/transacao/excluir/:id', () => {
    const mockResponse = { message: 'Transação excluída com sucesso' };

    service.excluirTransacao('test-uuid').subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/transacao/excluir/test-uuid`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
