import { TestBed } from '@angular/core/testing';

import { TableviewLogicService } from './tableview-logic.service';

describe('TableviewLogicService', () => {
  let service: TableviewLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableviewLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
