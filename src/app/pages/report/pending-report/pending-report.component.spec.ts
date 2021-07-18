import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingReportComponent } from './pending-report.component';

describe('PendingReportComponent', () => {
  let component: PendingReportComponent;
  let fixture: ComponentFixture<PendingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
