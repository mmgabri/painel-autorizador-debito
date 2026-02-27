import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.welcome-title')?.textContent).toContain('Dashboards Autorizador Débito');
  });

  it('should have 3 cards in grid3 section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.grid3 .card');
    expect(cards.length).toBe(3);
  });

  it('should have week card section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.week-card')).toBeTruthy();
  });

  it('should format volume correctly', () => {
    expect(component.formatVolume(8985632)).toContain('MI');
    expect(component.formatVolume(500000)).toBe('500.000');
    expect(component.formatVolume(null)).toBe('—');
  });

  it('should format money correctly', () => {
    expect(component.formatMoney(450236654.85)).toContain('R$');
    expect(component.formatMoney(450236654.85)).toContain('MI');
    expect(component.formatMoney(null)).toBe('—');
  });

  it('should load acumulado dia on button click', () => {
    component.onLoadAcumuladoDia();
    const req = httpMock.expectOne((r) => r.url.includes('/api/dashboard/acumulado-dia'));
    expect(req.request.method).toBe('GET');
    req.flush({
      data: '2026-02-27',
      ultima_atualizacao: '14:35:22',
      volume: 8985632,
      faturamento: 450236654.85,
      pico_hora_volume: 1250430,
      pico_hora_volume_faixa: '10:00 - 11:00',
      pico_hora_faturamento: 62540318.45,
      pico_hora_faturamento_faixa: '10:00 - 11:00',
      tps_atual: 342,
      tps_atual_hora: '14:35:22',
      pico_dia: 587,
      pico_dia_hora: '10:32:15',
    });
    expect(component.acumuladoDia()).toBeTruthy();
    expect(component.acumuladoDia()!.volume).toBe(8985632);
  });
});
