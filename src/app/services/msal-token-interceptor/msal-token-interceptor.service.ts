import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, of, throwError } from "rxjs";
import { MsalService } from '@azure/msal-angular';
import { AuthResponse, ClientAuthError } from 'msal';
import { catchError } from 'rxjs/operators';
import { error } from 'protractor';

@Injectable()
export class MsalTokenInterceptorService implements HttpInterceptor{

  private accessScopes = {scopes: ["5d98c088-fcf6-46b5-b2d8-d912c8126c0d/.default"]};

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

  async getAuthHeader(): Promise<string>
  {
    return new Promise<string>(resolve => {
      this._authService.acquireTokenSilent(this.accessScopes)
      .then((response: AuthResponse) => {
          const accessToken = response.accessToken;
          const authHeader = `Bearer ${accessToken}`;
          resolve(authHeader);
      })
      .catch(
        catchError((error: ClientAuthError) => {

          console.log("ClientAuthError caught!")

          return new Promise<string>(resolve => {
            this._authService.acquireTokenPopup(this.accessScopes)
            .then((response: AuthResponse) => {
              const accessToken = response.accessToken;
              const authHeader = `Bearer ${accessToken}`;
              resolve(authHeader);

              throwError(error);
            })
          })          
        })
      );      
    });
  }
}
