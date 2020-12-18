import { TestBed } from '@angular/core/testing';

import { LinframesDataService } from './linframes-data.service';

describe('LinframesDataService', () => {
  let service: LinframesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinframesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
