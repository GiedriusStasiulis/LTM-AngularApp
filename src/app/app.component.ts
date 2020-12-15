import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/component-state-service/sidebar.service';
import { mainContentAnimation } from './animations';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { Subject } from 'rxjs';
import { AccountInfo, BrowserCacheLocation, EventMessage, EventType, InteractionType } from '@azure/msal-browser';
import { concatMap, filter, takeUntil } from 'rxjs/operators';
import * as msal from "@azure/msal-browser";
import { SubSink } from 'subsink';
import { SignalRService } from './services/signalR/signal-r.service';
import { LinframesDataService } from './services/linframes-data/linframes-data.service';
import { LinFrame } from './models/linFrame';
import { ComponentStateService } from './services/component-state-service/component-state.service';
import { ComponentStateType } from './models/component-states/component-state-type-enum';
import { DevicesComponentState } from './models/component-states/devices-state';

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

const myMSALObj = new msal.PublicClientApplication(msalConfig);

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
  devicesComponentState: DevicesComponentState;
  deviceConnected: boolean;

  sidebarState: string;
  isIframe = false;
  loggedIn = false;
  private readonly _destroyed$ = new Subject<void>();
  
  constructor(@Inject(MSAL_GUARD_CONFIG) private _msalGuardConfig: MsalGuardConfiguration, 
              private _sidebarService: SidebarService, 
              private _broadcastService: MsalBroadcastService, 
              private _authService: MsalService,
              private _signalRService: SignalRService,
              private _linframesDataService: LinframesDataService,
              private _componentStateService: ComponentStateService)
  { }

  ngOnInit() {

    this.isIframe = window !== window.parent && !window.opener;

    this.checkAccount();

    this._signalRService.connectToSignalRHub();   
  
    this._broadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
          takeUntil(this._destroyed$)
        )
      .subscribe(() => {
          this.checkAccount();
      });

    //One sub to push frames to linframes-data.service
    this._signalRService.messageObservable$
      .pipe(
        takeUntil(this._destroyed$)
      )    
      .subscribe(async message => {
        var elementsToPush: LinFrame[] = this.parseLinFramePacket(JSON.parse(message));
        this._linframesDataService.pushFramesToObservable(elementsToPush);
    });    

    this._sidebarService.sidebarStateObservable$
      .pipe(
        takeUntil(this._destroyed$)
      )
      .subscribe((newState: string) => {
        this.sidebarState = newState;
    });

    this._componentStateService.devicesComponentState$
      .pipe(
        concatMap(async (item) => item),
        takeUntil(this._destroyed$)
      )
      .subscribe(result => {
        this.devicesComponentState = result;
      });     
  }

  //#region Methods - MSAL Authentication
  checkAccount() {
    this.loggedIn = this._authService.instance.getAllAccounts().length > 0;

    if(this.loggedIn)
    {
      const myAccounts: AccountInfo[] = myMSALObj.getAllAccounts();
      const localAccount = myAccounts[0];
      sessionStorage.setItem("signedInAccount", JSON.stringify(localAccount));
    }    
  }

  login() {
    if (this._msalGuardConfig.interactionType === InteractionType.Popup) {
      this._authService.loginPopup({...this._msalGuardConfig.authRequest})
        .subscribe(() => {
          this.checkAccount();
        });
    } else {
      this._authService.loginRedirect({...this._msalGuardConfig.authRequest});
    }
  }

  logout() {
    this._authService.logout();
  }
  //#endregion

  //#region Methods - SignalR Service
  parseLinFramePacket(message: any)
  {
    const LIN_FRAMES: LinFrame[] = [];

    const ssid = message.DEVID.split('_');
    
    for(let i = 0; i < Object.keys(message.FRAMES).length; i++)
    {      
      const payloadArr = message.FRAMES[i].FDATA.match(/..?/g)

      const FRAME: LinFrame = {
        SessionID: ssid[1],
        PCKNO: message.PCKNO,
        FNO: message.FRAMES[i].FNO,
        PID: payloadArr[0],
        //PID_DEC: parseInt(payloadArr[0], 16),
        FDATA0: payloadArr[1],
        FDATA1: payloadArr[2],
        FDATA2: payloadArr[3],
        FDATA3: payloadArr[4],
        FDATA4: payloadArr[5],
        FDATA5: payloadArr[6],
        FDATA6: payloadArr[7],
        FDATA7: payloadArr[8]
      };

      LIN_FRAMES.push(FRAME);
    }

    return LIN_FRAMES;
  }

  //#endregion

  @HostListener('window:beforeunload',['$event'])
  async ngOnDestroy(event: { preventDefault: () => void; returnValue: string; }) {
  
    if(this.devicesComponentState.deviceConnected)
    {      
      (await this._signalRService.removeUserFromSignalRGroup()).subscribe(() => {
        
        this.devicesComponentState.deviceConnected = false;
        this._componentStateService.saveComponentState(ComponentStateType.DevicesComponentState, this.devicesComponentState);
      });       

      if(event)
      {
        event.preventDefault();
        event.returnValue = 'A message.';
      }
    }

    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}
