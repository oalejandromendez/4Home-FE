import { TestBed } from '@angular/core/testing';

import { CustomertypeService } from './customertype.service';

describe('CustomertypeService', () => {
  let service: CustomertypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomertypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
