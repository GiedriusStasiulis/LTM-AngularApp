import { TestBed } from '@angular/core/testing';

import { MonitoringChartviewLogicService } from './monitoring-chartview-logic.service';

describe('MonitoringChartviewLogicService', () => {
  let service: MonitoringChartviewLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitoringChartviewLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
