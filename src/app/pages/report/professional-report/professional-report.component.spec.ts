import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalReportComponent } from './professional-report.component';

describe('ProfessionalReportComponent', () => {
  let component: ProfessionalReportComponent;
  let fixture: ComponentFixture<ProfessionalReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfessionalReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessionalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
