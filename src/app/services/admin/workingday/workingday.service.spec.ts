import { TestBed } from '@angular/core/testing';

import { WorkingdayService } from './workingday.service';

describe('WorkingdayService', () => {
  let service: WorkingdayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkingdayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
