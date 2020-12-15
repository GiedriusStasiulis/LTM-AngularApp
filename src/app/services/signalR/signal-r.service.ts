import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SignalRConnectionInfo } from 'src/app/models/signal-r-connection-info';
import * as signalR from '@aspnet/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private readonly azureUrl: string = "https://ltmfunctionsappv2.azurewebsites.net/api/"; 
  private hubConnection: HubConnection | undefined;

  private message$: Subject<string>;
  public messageObservable$: Observable<string>;

  constructor(private _httpClient: HttpClient) {
    this.message$ = new Subject<string>();
    this.messageObservable$ = this.message$.asObservable();  
  }

  public selectedDeviceId$ = new BehaviorSubject<string>("");

  getSignalRConnectionInfo(): Observable<SignalRConnectionInfo>
  {
    let requestUrl: string = `${this.azureUrl}negotiate`;
    return this._httpClient.get<SignalRConnectionInfo>(requestUrl);
  }

  connectToSignalRHub()
  {
      this.getSignalRConnectionInfo().subscribe(results => {

        this.init(results);

        //console.log(this.getSelectedDeviceId());

        console.log("SignalR Service started!")
      }, err => {
        console.log(err);
      }); 
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

    this.hubConnection.serverTimeoutInMilliseconds = 30000; //30 sec

    this.hubConnection.start()
      .catch(
        err => {
          this.announceErrorMessage(err);
        }
      );
    
    this.hubConnection.on('notifyFrames', (data: any) => {
      this.announceMessage(data);
    });   
    
    this.hubConnection.onclose(
      (_error) => {
      if(this.hubConnection) {
        this.hubConnection.stop();
      }
      console.log("Something went wrong: " + _error)
    });
  }

  addUserToSignalRGroup(_deviceId: string): Observable<object>
  {
    this.selectedDeviceId$.next(_deviceId);

    let requestUrl: string = `${this.azureUrl}AddUserToSignalRGroup/${_deviceId}`;
    return this._httpClient.get(requestUrl);
  }

  async removeUserFromSignalRGroup(): Promise<Observable<object>>
  {
    let selectedId = this.selectedDeviceId$.value;

    console.log("Removing user in service ...")
    console.log(selectedId);

    let requestUrl: string = `${this.azureUrl}RemoveUserFromSignalRGroup/${selectedId}`;
    return this._httpClient.get(requestUrl);
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
}
