import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/component-state-service/sidebar.service';
import { sidebarAnimation, iconAnimation, labelAnimation } from 'src/app/animations';
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

  public sidebarState: string;
  public show: boolean = false; 
  public enableDropRightMenu: boolean = false;
  profileName: any;
  profileEmail: any;

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

    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);
    this.profileName = accInfo.name;
    this.profileEmail = accInfo.username;
  }

  logout() {
    this._authService.logout();
  }
}
