import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { SignalRConnectionInfo } from 'src/app/models/signal-r-connection-info';
import * as signalR from '@aspnet/signalr';
import { MsalTokenService } from '../msal-token-service/msal-token.service';
import { SubSink } from 'subsink';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  //private readonly azureUrl: string = "http://localhost:7071/api/";
  private readonly azureUrl: string = "https://ltmfunctionsappv2.azurewebsites.net/api/"; 
  //https://ltmfunctionsapp.azurewebsites.net
  private hubConnection: HubConnection | undefined;

  subSinkSubscription = new SubSink();

  private message$: Subject<string>;
  public messageObservable$: Observable<string>;

  private deviceConnectionCount: number = 0;
  private deviceConnectionCount$: Subject<number>;
  public deviceConnectionCountObservable$: Observable<number>

  authHeader: string = ''; 
  signalRServiceStarted: boolean = false;

  constructor(private _httpClient: HttpClient, private _msalTokenService: MsalTokenService) {
    this.message$ = new Subject<string>();
    this.messageObservable$ = this.message$.asObservable();

    this.deviceConnectionCount$ = new Subject<number>();
    this.deviceConnectionCount$.next(this.deviceConnectionCount);
    this.deviceConnectionCountObservable$ = this.deviceConnectionCount$.asObservable();

    sessionStorage.setItem("signalRServiceStarted", `${this.signalRServiceStarted}`);

    this.subSinkSubscription.sink = this.deviceConnectionCountObservable$.subscribe(deviceConnectionCount => {

      console.log("Connected devices: " + JSON.stringify(deviceConnectionCount));
      var deviceCount = JSON.stringify(deviceConnectionCount);

      this.signalRServiceStarted = JSON.parse(sessionStorage.getItem("signalRServiceStarted"))

      if(+deviceCount == 1 && !this.signalRServiceStarted)
      {
        this.startSignalRClient();
      }
      else if(+deviceCount == 0 && this.signalRServiceStarted)
      {
        this.stopSignalRClient();
      }
    });  
   }

  async getSignalRConnectionInfo(): Promise<Observable<SignalRConnectionInfo>> 
  {
    this.authHeader = await this._msalTokenService.getAuthHeader();

    let requestUrl: string = `${this.azureUrl}negotiate`;

    return this._httpClient.get<SignalRConnectionInfo>(requestUrl, 
      {
        headers: new HttpHeaders({ 
          'Authorization': `${this.authHeader}`, 
          'Content-Type': 'application/json'}) 
      });
  }

  async startSignalRClient()
  {
      (await this.getSignalRConnectionInfo()).subscribe(results => {
        this.init(results);
        console.log("SignalR Service started!")
        this.signalRServiceStarted = true;
        sessionStorage.setItem("signalRServiceStarted", `${this.signalRServiceStarted}`);
      }, err => {
        console.log(err);
      });
  }

  //To-Do?
  async stopSignalRClient()
  {
    console.log("Stoping SignalR Service!");
    this.signalRServiceStarted = false;
    sessionStorage.setItem("signalRServiceStarted", `${this.signalRServiceStarted}`);
  }

  init(_signalRConnectionInfo: SignalRConnectionInfo): void {

    let options: signalR.IHttpConnectionOptions = {
      accessTokenFactory: () => _signalRConnectionInfo.accessToken
    };

    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(_signalRConnectionInfo.url, options)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

    this.hubConnection.serverTimeoutInMilliseconds = 300000; //5 min

    this.hubConnection.start()
    .catch(
      err => {
        this.announceErrorMessage(err);
      }
    );

    this.hubConnection.on('notify', (data: any) => {
      //console.log("Notification: " + data);
      this.announceMessage(data);
      //console.log(data);
    });

    this.hubConnection.onclose((_error) => {
      if(this.hubConnection) {
        this.hubConnection.start();
      }
      console.log("Something went wrong: " + _error)
    });
  }

  async addUserToSignalRGroup(_deviceId: string): Promise<Observable<object>>
  {
    this.authHeader = await this._msalTokenService.getAuthHeader();

    let requestUrl: string = `${this.azureUrl}AddUserToSignalRGroup/${_deviceId}`;

    return this._httpClient.get(requestUrl, {
      headers: new HttpHeaders({ 
        'Authorization': `${this.authHeader}`, 
        'Content-Type': 'application/json'}) 
    });
  }

  async removeUserFromSignalRGroup(_deviceId: string): Promise<Observable<object>>
  {
    this.authHeader = await this._msalTokenService.getAuthHeader();

    let requestUrl: string = `${this.azureUrl}RemoveUserFromSignalRGroup/${_deviceId}`;
    return this._httpClient.get(requestUrl, {
      headers: new HttpHeaders({ 
        'Authorization': `${this.authHeader}`, 
        'Content-Type': 'application/json'}) 
    });
  }

  private announceMessage(message: string): void {
    this.message$.next(message);
  }

  private announceErrorMessage(content: any): void {
    if (content instanceof HttpErrorResponse || content instanceof Error) {
      this.announceMessage(`Error: ${content.message}`);
    } else {
      this.announceMessage(content);
    }
  }

  addDeviceConnection()
  {
    if(this.deviceConnectionCount >= 0)
    {
      this.deviceConnectionCount = this.deviceConnectionCount + 1;
      this.deviceConnectionCount$.next(this.deviceConnectionCount);
    }    
  }

  removeDeviceConnection()
  {
    if(this.deviceConnectionCount >= 1)
    {
      this.deviceConnectionCount = this.deviceConnectionCount - 1;
      this.deviceConnectionCount$.next(this.deviceConnectionCount);
    }    
  }
}
