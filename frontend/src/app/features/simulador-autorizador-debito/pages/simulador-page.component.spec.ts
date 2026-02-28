import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SimuladorPageComponent } from './simulador-page.component';
import { environment } from '../../../environments/environment';

describe('SimuladorPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimuladorPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show main view with 3 buttons by default', () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.fixed-top-actions button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent?.trim()).toContain('Disparar transação');
    expect(buttons[1].textContent?.trim()).toContain('Incluir transação');
    expect(buttons[2].textContent?.trim()).toContain('Excluir transação');
  });

  it('should switch to incluir view when clicking Incluir transação', () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onIncluirTransacao();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.incluir-panel')).toBeTruthy();
    expect(compiled.querySelector('.fixed-top-actions')).toBeTruthy();
  });

  it('should render the correct number of bit fields after loading campos', async () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Switch to incluir view
    component.onIncluirTransacao();
    fixture.detectChanges();

    // Set message and load campos
    component.incluirForm.controls.message.setValue('0200ABCDEF');
    component.onCarregarCampos();

    const mockMap: Record<string, string> = {
      '02': '5454545454',
      '03': '0000',
      '04': '000005212',
    };

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/iso8583/parse`);
    req.flush(mockMap);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const matFormFields = compiled.querySelectorAll('.bits-vertical mat-form-field');
    expect(matFormFields.length).toBe(3);

    const labels = Array.from(compiled.querySelectorAll('.bits-vertical mat-label')).map(
      (el) => el.textContent?.trim(),
    );
    expect(labels).toEqual(['Bit 02', 'Bit 03', 'Bit 04']);
  });

  it('should add a field via onIncluirCampo', () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onIncluirTransacao();
    component.onIncluirCampo(2);
    component.onIncluirCampo(4);

    expect(component.sortedKeys()).toEqual(['02', '04']);
  });

  it('should remove a field via onRemoverCampo', () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onIncluirTransacao();
    component.onIncluirCampo(2);
    component.onIncluirCampo(3);
    component.onIncluirCampo(4);
    component.onRemoverCampo('03');

    expect(component.sortedKeys()).toEqual(['02', '04']);
  });

  it('should switch to disparar view and load fields when opening via dialog', async () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Simulate opening disparar view directly (bypassing dialog)
    const mockTransacao = {
      id: 'test-uuid',
      nomeProduto: 'Produto Teste',
      tag: 'TAG1',
      descricao: 'Desc',
      mensagemIso: '0200AABBCC',
      criadoEm: '2026-01-01T00:00:00Z',
    };

    component.selectedTransacao.set(mockTransacao);
    component.activeView.set('disparar');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.disparar-panel')).toBeTruthy();
    expect(compiled.querySelector('.fixed-top-actions')).toBeTruthy();
  });

  it('should show response fields after executing transaction', () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Set up disparar view
    component.selectedTransacao.set({
      id: 'test-uuid',
      nomeProduto: 'Produto Teste',
      tag: 'TAG1',
      descricao: 'Desc',
      mensagemIso: '0200AABBCC',
      criadoEm: '2026-01-01T00:00:00Z',
    });
    component.activeView.set('disparar');
    component.showResponse.set(true);
    component.responseFields.set({ '02': '5454545454', '39': '00' });
    component.responseSortedKeys.set(['02', '39']);
    component.responseMessage.set('Transação autorizada com sucesso');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const responseCard = compiled.querySelectorAll('.card-legend');
    const legends = Array.from(responseCard).map((el) => el.textContent?.trim());
    expect(legends).toContain('Campos ISO Response');
  });
});
