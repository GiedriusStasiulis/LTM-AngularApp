import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  profileName: any;

  constructor(private _authService: MsalService) { }

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.profileName = this._authService.getAccount().name;
  }

  logout() {
    this._authService.logout();
  }
  
}
