import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label, Color } from 'ng2-charts';

@Component({
  selector: 'app-monitoring-chartview',
  templateUrl: './monitoring-chartview.component.html',
  styleUrls: ['./monitoring-chartview.component.css']
})
export class MonitoringChartviewComponent implements OnInit {

    // Array of different segments in chart
    lineChartData: ChartDataSets[] = [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' }
    ];
  
    //Labels shown on the x-axis
    lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  
    // Define chart options
    lineChartOptions: ChartOptions = {
      responsive: true
    };
  
    // Define colors of chart segments
    lineChartColors: Color[] = [
  
      { // dark grey
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
      },
      { // red
        backgroundColor: 'rgba(255,0,0,0.3)',
        borderColor: 'red',
      }
    ];
  
    // Set true to show legends
    lineChartLegend = true;
  
    // Define type of chart
    lineChartType = 'line';
  
    lineChartPlugins = [];

    constructor()
    {}
  
    ngOnInit(): void {
      
    }

    // events
    chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
      console.log(event, active);
    }
  
    chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
      console.log(event, active);
    }
}
