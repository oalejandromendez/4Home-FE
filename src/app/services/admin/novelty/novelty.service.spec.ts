import { TestBed } from '@angular/core/testing';

import { NoveltyService } from './novelty.service';

describe('NoveltyService', () => {
  let service: NoveltyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoveltyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
