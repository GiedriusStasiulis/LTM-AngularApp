import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { sidebarAnimation, iconAnimation, labelAnimation } from 'src/app/animations';
import { IotDevice } from '../../models/iotDevice';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    sidebarAnimation(),
    iconAnimation(),
    labelAnimation(),
  ]
})
export class SidebarComponent implements OnInit {

  public deviceList: IotDevice[] = [{id:"ESP32_SIM1"},{id:"ESP32_SIM2"},{id:"ESP32_DEV1"}];

  public sidebarState: string;
  public show: boolean = false; 
  public enableDropRightMenu: boolean = false;
  profileName: any;

  constructor(private _sidebarService: SidebarService, private _authService: MsalService) { }

  ngOnInit() {

    this.getProfile();

    this._sidebarService.sidebarStateObservable$.
      subscribe((newState: string) => {
        if(newState === 'close')
        {
          this.show = false;
          this.enableDropRightMenu = true;
        }
        else
        {
          this.enableDropRightMenu = false;
        }
        
        this.sidebarState = newState;        
      });
  }

  getProfile() {
    this.profileName = this._authService.getAccount().name;
  }

  logout() {
    this._authService.logout();
  }
}
