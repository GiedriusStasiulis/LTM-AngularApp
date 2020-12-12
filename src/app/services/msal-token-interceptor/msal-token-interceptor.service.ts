import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from } from "rxjs";
import * as msal from "@azure/msal-browser";
import { MsalService } from '@azure/msal-angular';
import { BrowserCacheLocation } from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

const msalConfig = {
  auth: {
    clientId: '5d98c088-fcf6-46b5-b2d8-d912c8126c0d',
      authority: 'https://login.microsoftonline.com/7d980800-3399-486f-9751-570df69d59b0',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200',
      navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11
  }
};


@Injectable()
export class MsalTokenInterceptorService implements HttpInterceptor{

  private signedInAccount : any;

  constructor(private _authService: MsalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return from(this.handle(req,next));
  }
 
  async handle(req: HttpRequest<any>, next: HttpHandler)
  {
    if (!req.headers.has('Content-Type')) {
      req = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
      });
    }

    let authToken = await this.getAuthHeader();

    const authReq = req.clone({
      setHeaders: {
        Authorization: authToken
      }
    })

    return next.handle(authReq).toPromise();
  }

  getSignedInAccount()
  {
    const currentAccounts = this._authService.instance.getAllAccounts();
    if(!currentAccounts || currentAccounts.length === 0)
    {
      //No user logged in!
      return;
    }
    else if(currentAccounts.length > 1)
    {
      this.signedInAccount = currentAccounts[0];
    }
  }

  async getAuthHeader(): Promise<string>
  {
    this.getSignedInAccount();

    const silentRequest = {
      account: this.signedInAccount,
      scopes: ["5d98c088-fcf6-46b5-b2d8-d912c8126c0d/.default"]
    }

    return new Promise<string>(resolve => {
      this._authService.acquireTokenSilent(silentRequest).subscribe(response => {
        const accessToken = response.accessToken;
        const authHeader = `Bearer ${accessToken}`;
        resolve(authHeader);
      })
    })

    //return null;

    /*return new Promise<string>(resolve => {
      this._authService.acquireTokenSilent(this.accessScopes)
      .then((response: AuthResponse) => {
          const accessToken = response.accessToken;
          const authHeader = `Bearer ${accessToken}`;
          resolve(authHeader);
      })   
    });*/
  }
}
