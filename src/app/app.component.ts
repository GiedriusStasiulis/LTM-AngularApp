import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { mainContentAnimation } from './animations';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Logger, CryptoUtils, AuthResponse } from 'msal';
import { MsalTokenInterceptorService } from './services/msal-token-interceptor/msal-token-interceptor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    mainContentAnimation(),
  ]
})
export class AppComponent implements OnInit
{
  sidebarState: string;
  loggedIn = false;
  subscription: any;

  private accessScopes = {scopes: ["5d98c088-fcf6-46b5-b2d8-d912c8126c0d/.default"]};
  private token = "noToken";
  
  constructor(private _sidebarService: SidebarService, private _broadcastService: BroadcastService, private _authService: MsalService) { }

  ngOnInit() {

    this._sidebarService.sidebarStateObservable$
      .subscribe((newState: string) => {
        this.sidebarState = newState;
      });

    this.checkoutAccount();    

    this._broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkoutAccount();    
    });

    this.subscription =  this._broadcastService.subscribe("msal:acquireTokenSuccess", (payload) => {
      
    })

    this.subscription =  this._broadcastService.subscribe("msal:acquireTokenFailure", (payload) => {
    });

    this._authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }

      console.log('Redirect Success: ', response);
    });

    this._authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
      console.log('MSAL Logging: ', message);
    }, {
      correlationId: CryptoUtils.createNewGuid(),
      piiLoggingEnabled: false
    }));

    /*if(!this.loggedIn)
    {
      //this.login();
    }   */ 
  }

  checkoutAccount() {
    this.loggedIn = !!this._authService.getAccount();
  }

  login() {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this._authService.loginRedirect();
    } else {
      this._authService.loginPopup();
    }
  }

  logout() {
    localStorage.clear();
    this._authService.logout();    
  } 

  ngOnDestroy() {

    this._authService.logout();

    this._broadcastService.getMSALSubject().next(1);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
