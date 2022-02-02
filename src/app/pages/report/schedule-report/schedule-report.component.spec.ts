import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleReportComponentOld } from './schedule-report.component-old';

describe('ScheduleReportComponent', () => {
  let component: ScheduleReportComponentOld;
  let fixture: ComponentFixture<ScheduleReportComponentOld>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleReportComponentOld ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleReportComponentOld);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
