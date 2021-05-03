import { TestBed } from '@angular/core/testing';

import { ServicetypeService } from './servicetype.service';

describe('ServicetypeService', () => {
  let service: ServicetypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicetypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
