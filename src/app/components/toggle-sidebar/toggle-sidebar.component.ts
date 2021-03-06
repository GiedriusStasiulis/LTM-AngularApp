import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/component-state-service/sidebar.service';

@Component({
  selector: 'app-toggle-sidebar',
  templateUrl: './toggle-sidebar.component.html',
  styleUrls: ['./toggle-sidebar.component.css']
})
export class ToggleSidebarComponent implements OnInit {

  constructor(private sidebarService: SidebarService) { }

  sidebarState: string;

  ngOnInit() {
    this.sidebarState = this.sidebarService.sidebarState;
   }

  toggleSideNav() {
    this.sidebarService.toggle();
    this.sidebarState = this.sidebarService.sidebarState;
  }
}
