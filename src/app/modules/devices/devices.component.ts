import { Component, OnInit, ViewChild } from '@angular/core';
import { LinFrame } from '../../models/linFrame'
import { MatSort } from '@angular/material/sort';
import { SubSink } from 'subsink/dist/subsink';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ComponentStateService } from '../../services/component-state-service/component-state.service';
import { DevicesComponentState } from 'src/app/models/component-states/devices-state';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';
import { LinframesDataService } from 'src/app/services/linframes-data/linframes-data.service';
import { BehaviorSubject } from 'rxjs';
import { UserSettingsItem } from 'src/app/models/userSettingsItem';
import { SettingsDataService } from 'src/app/services/settings-data/settings-data.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {

  //Table variables
  @ViewChild(MatSort) sort: MatSort;

  tableContainer: HTMLElement;
  table: HTMLElement;

  displayedColumns: string[] = ['sessionId','packetNo','frameNo', 'pidHex', 'pidDec', 'pidName', 'payload0', 'payload0Name', 'payload1', 'payload2', 'payload3', 'payload4', 'payload5', 'payload6', 'payload7'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  selectedRow : boolean;  

  alwaysScrollToBottom: boolean;

  //Subscription
  userSettingsSub = new SubSink();
  deviceConnectedSub = new SubSink();
  signalRMessagesSub = new SubSink();
  linframesDataServiceSub = new SubSink();

  signalRServiceStarted: boolean = false;
  messages: string[] = [];

  //Component variables
  devicesComponentState: DevicesComponentState;

  //Other variables
  timestamp: string = ''; 

  devices = [
        { id: 1, name: 'ESP32SIM1' },
        { id: 2, name: 'ESP32DEV1' }
    ];

  linFramesObservableList: LinFrame[] = [];
  linFramesObservableList$ = new BehaviorSubject<LinFrame[]>([]);

  userSettingsItems: UserSettingsItem[] = [];  

  selectedDevice = this.devices[0].name;

  constructor(private _signalRService: SignalRService, 
              private _componentStateService: ComponentStateService, 
              private _linframesDataService: LinframesDataService,
              private _settingsDataService: SettingsDataService) 
  {  }  
  
  ngOnInit() 
  { 
    this.loadComponentState();

    if(this.devicesComponentState == null)
    {
      //New component instance, fresh browser open
      this.initComponentState();
    }    

    this.userSettingsSub.sink = this._settingsDataService.getAllUserSettings(this.getLoggedInAccountID()).subscribe(    
      userSettingsItems => {    

        userSettingsItems.forEach(element => {
            console.log("PID Hex: " + element.pidHexValue);
        });

        this.userSettingsItems = userSettingsItems; 
      },    
      error => console.log(error)   
    ); 

    //Observes the frames in linframes-data.service
    this.linframesDataServiceSub.sink = this._linframesDataService.linFramesList$.subscribe(async frames => {

      var framesToLoad: LinFrame[] = frames;
      
      if(this.devicesComponentState.deviceConnected)
      {
        this.loadDataToTable(framesToLoad, 0);      
      }

      else
      {
        this.loadDataToTable(framesToLoad, 1);
      }
    }); 
  }

  async loadDataToTable(_linFrames: LinFrame[], option: number)
  {
    this.tableContainer = document.getElementById("tableContainer");
    this.table = document.getElementById("vertical_scroll_table");

    this.userSettingsItems.forEach(element => {
      let itemIndex = _linFrames.findIndex(r => r.PID_HEX === element.pidHexValue);

      if(itemIndex != -1)
      {
        _linFrames[itemIndex].PID_Name = element.pidName;
        _linFrames[itemIndex] = _linFrames[itemIndex];
      }
    });

    switch(option)
    {
      //Iterate with small delay
      case 0:

        var observableListLenght = this.linFramesObservableList$.getValue().length;
        var framesToAddLength = _linFrames.length;

        for(let i = observableListLenght; i < framesToAddLength; i++){

          const NEW_FRAMES = this.linFramesObservableList$.value.concat(_linFrames[i]);
          this.linFramesObservableList$.next(NEW_FRAMES)

          if(this.devicesComponentState.alwaysScrollToBottom && this.table.scrollHeight > this.tableContainer.clientHeight)
          {
            this.tableContainer.scrollTop = this.tableContainer.scrollHeight;
          } 

          await this.delay(5);
        }

        if(this.devicesComponentState.alwaysScrollToBottom && this.table.scrollHeight > this.tableContainer.clientHeight)
        {
          this.tableContainer.scrollTop = this.tableContainer.scrollHeight;
        } 

        break;

      //Load all data at once
      case 1:

        this.linFramesObservableList$.next(_linFrames);

        break;
    }
  }

  ngOnDestroy() {

    //this.removeUserFromSignalRGroup();
    this.devicesComponentState.deviceConnected = false;
    this.saveComponentState(this.devicesComponentState);
    
  }

  //SignalR Service functions
  addUserToSignalRGroup()
  {
    this._signalRService.addUserToSignalRGroup("ESP32SIM1").subscribe(results => {
        console.log("Results: " + JSON.stringify(results));
        
        this.devicesComponentState.deviceConnected = true;
        this.saveComponentState(this.devicesComponentState);
      },
        err => {
          console.log("Error: " + JSON.stringify(err));
        }      
      );
  }

  removeUserFromSignalRGroup()
  {    
    this._signalRService.removeUserFromSignalRGroup("ESP32SIM1").subscribe(results => {
      console.log("Results: " + JSON.stringify(results));
      
      this.devicesComponentState.deviceConnected = false;   
      this.saveComponentState(this.devicesComponentState);      
    },
      err => {
        console.log("Error: " + JSON.stringify(err));
      }      
    );   
  }

  //Table functions
 

  onRowClicked(_row: boolean) 
  {
    if(!this.selectedRow)
    {
      this.selectedRow = _row;
    }   
    else
    {
      this.selectedRow = _row;
    } 
  }

  /*applyFilter(_event: Event) {
    const filterValue = (_event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }*/
 

  //Component state functions
  initComponentState()
  {
    this.devicesComponentState = new DevicesComponentState();

    //Set default properties
    this.devicesComponentState.deviceConnected = false;
    this.devicesComponentState.deviceId = "ESP32SIM1";
    this.devicesComponentState.sessionIds = [];
    this.devicesComponentState.alwaysScrollToBottom = true;
  }

  saveComponentState(_deviceComponentState: DevicesComponentState)
  {
    this._componentStateService.saveComponentState(ComponentStateType.DevicesComponentState, _deviceComponentState);
  }

  loadComponentState()
  {
    this.devicesComponentState = this._componentStateService.loadComponentState(ComponentStateType.DevicesComponentState);
  }

  getLoggedInAccountID()
  {
    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);

    return accInfo.localAccountId;
  }

  //MISQ
  getCurrentDateTime(): string
  {
    let dTimeNow = new Date().toLocaleString();
    return dTimeNow;
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
