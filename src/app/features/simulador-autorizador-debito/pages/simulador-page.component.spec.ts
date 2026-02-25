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

  it('should render the correct number of bit fields after parsing', async () => {
    const fixture = TestBed.createComponent(SimuladorPageComponent);
    const component = fixture.componentInstance;

    component.formIso.controls.message.setValue('0200ABCDEF');
    component.onParse();

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
});
