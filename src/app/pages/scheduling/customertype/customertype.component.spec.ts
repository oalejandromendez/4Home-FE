import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomertypeComponent } from './customertype.component';

describe('CustomertypeComponent', () => {
  let component: CustomertypeComponent;
  let fixture: ComponentFixture<CustomertypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomertypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomertypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
