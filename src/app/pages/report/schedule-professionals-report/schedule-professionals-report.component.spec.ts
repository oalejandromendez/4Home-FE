import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleProfessionalsReportComponent } from './schedule-professionals-report.component';

describe('ScheduleProfessionalsReportComponent', () => {
  let component: ScheduleProfessionalsReportComponent;
  let fixture: ComponentFixture<ScheduleProfessionalsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleProfessionalsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleProfessionalsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
