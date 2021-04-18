import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingdayComponent } from './workingday.component';

describe('WorkingdayComponent', () => {
  let component: WorkingdayComponent;
  let fixture: ComponentFixture<WorkingdayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingdayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
