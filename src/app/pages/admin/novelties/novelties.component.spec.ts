import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoveltiesComponent } from './novelties.component';

describe('NoveltiesComponent', () => {
  let component: NoveltiesComponent;
  let fixture: ComponentFixture<NoveltiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoveltiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoveltiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
