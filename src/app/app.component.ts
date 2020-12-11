import { Component, Inject, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar.service';
import { mainContentAnimation } from './animations';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { EventMessage, EventType, InteractionType } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';

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
  isIframe = false;
  loggedIn = false;
  private readonly _destroying$ = new Subject<void>();
  
  constructor(@Inject(MSAL_GUARD_CONFIG) private _msalGuardConfig: MsalGuardConfiguration, 
              private _sidebarService: SidebarService, 
              private _broadcastService: MsalBroadcastService, 
              private _authService: MsalService) 
  { }

  ngOnInit() {

    this._sidebarService.sidebarStateObservable$
      .subscribe((newState: string) => {
        this.sidebarState = newState;
      });

    this.isIframe = window !== window.parent && !window.opener;

    this.checkAccount();

    //Get logged in user id
  
    this._broadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
          takeUntil(this._destroying$)
        )
      .subscribe(() => {
          this.checkAccount();
      });
  }

  checkAccount() {
    this.loggedIn = this._authService.instance.getAllAccounts().length > 0;
  }

  login() {
    if (this._msalGuardConfig.interactionType === InteractionType.Popup) {
      this._authService.loginPopup({...this._msalGuardConfig.authRequest})
        .subscribe(() => this.checkAccount());
    } else {
      this._authService.loginRedirect({...this._msalGuardConfig.authRequest});
    }
  }

  logout() {
    this._authService.logout();
  }

  ngOnDestroy(): void {
    this._destroying$.next(null);
    this._destroying$.complete();
  }
}
