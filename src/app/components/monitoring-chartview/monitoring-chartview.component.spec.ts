import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringChartviewComponent } from './monitoring-chartview.component';

describe('MonitoringChartviewComponent', () => {
  let component: MonitoringChartviewComponent;
  let fixture: ComponentFixture<MonitoringChartviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitoringChartviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringChartviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
