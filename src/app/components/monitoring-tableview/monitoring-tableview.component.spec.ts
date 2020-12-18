import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringTableviewComponent } from './monitoring-tableview.component';

describe('MonitoringTableviewComponent', () => {
  let component: MonitoringTableviewComponent;
  let fixture: ComponentFixture<MonitoringTableviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitoringTableviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringTableviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
