import { TestBed } from '@angular/core/testing';

import { MonitoringTableviewLogicService } from './monitoring-tableview-logic.service';

describe('MonitoringTableviewLogicService', () => {
  let service: MonitoringTableviewLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitoringTableviewLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
