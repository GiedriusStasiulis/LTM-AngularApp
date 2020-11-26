import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthResponse } from 'msal';

@Injectable({
  providedIn: 'root'
})
export class MsalTokenService {

  private accessScopes = {scopes: ["5d98c088-fcf6-46b5-b2d8-d912c8126c0d/.default"]};

  constructor(private _authService: MsalService) 
  { }

  async getAuthHeader(): Promise<string>
  {
    return new Promise<string>(resolve => {
      this._authService.acquireTokenSilent(this.accessScopes)
      .then((response: AuthResponse) => {
          const accessToken = response.accessToken;
          const authHeader = `Bearer ${accessToken}`;
          resolve(authHeader);
      });      
    });
  }
}
