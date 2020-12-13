import { Component, OnInit, ViewChild } from '@angular/core';
import { LinFrame } from '../../models/linFrame'
import { MatSort } from '@angular/material/sort';
import { SubSink } from 'subsink/dist/subsink';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ComponentStateService } from '../../services/component-state-service/component-state.service';
import { DevicesComponentState } from 'src/app/models/component-states/devices-state';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';
import { LinframesDataService } from 'src/app/services/linframes-data/linframes-data.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserSettingsItem } from 'src/app/models/userSettingsItem';
import { SettingsDataService } from 'src/app/services/settings-data/settings-data.service';
import { ThemePalette } from '@angular/material/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

let $ = require('../../../../node_modules/jquery/dist/jquery.min.js');

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {

  //Table variables
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  tableContainer: HTMLElement;
  table: HTMLElement;
  tableHeaderPIDDecTop: HTMLElement;
  tableHeaderPIDNameTop: HTMLElement;
  tableHeaderP0NameTop: HTMLElement;
  tableHeaderPIDDecBottom: HTMLElement;
  tableHeaderPIDNameBottom: HTMLElement;
  tableHeaderP0NameBottom: HTMLElement;
  tableColumnPIDDecBottom: HTMLElement;
  tableColumnPIDNameBottom: HTMLElement;
  tableColumnP0NameBottom: HTMLElement;

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

  columns = [
        { id: 1, name: 'Session ID'},
        { id: 2, name: 'Packet No.'},
        { id: 3, name: 'PID (Hex)'},
        { id: 4, name: 'PID (Dec)'},
        { id: 5, name: 'PID Name'},
        { id: 6, name: 'Payload[0] Name'},
        { id: 7, name: 'Payload[1] Name'},
        { id: 8, name: 'Payload[2] Name'},
        { id: 9, name: 'Payload[3] Name'},
        { id: 10, name: 'Payload[4] Name'},
        { id: 11, name: 'Payload[5] Name'},
        { id: 12, name: 'Payload[6] Name'},
        { id: 13, name: 'Payload[7] Name'},
  ];

  selectedColumn : any;

  additionalColumns = [
        { id: 1, name: 'PID (Dec)', type: 'Select All'},
        { id: 2, name: 'PID Name', type: 'Select All'},
        { id: 3, name: 'Payload[0] Name', type: 'Select All'},
        { id: 4, name: 'Payload[1] Name', type: 'Select All'},
        { id: 5, name: 'Payload[2] Name', type: 'Select All'},
        { id: 6, name: 'Payload[3] Name', type: 'Select All'},
        { id: 7, name: 'Payload[4] Name', type: 'Select All'},
        { id: 8, name: 'Payload[5] Name', type: 'Select All'},
        { id: 9, name: 'Payload[6] Name', type: 'Select All'},
        { id: 10, name: 'Payload[7] Name', type: 'Select All'},
  ];

  selectedAdditionalColumns = [];
  selectedAdditionalColumns$ = new BehaviorSubject<number[]>([]);
  pidDecColumnToggle: boolean;
  pidNameColumnToggle: boolean;
  p0NameColumnToggle: boolean;

  linFramesObservableList: LinFrame[] = [];
  linFramesObservableList$ = new BehaviorSubject<LinFrame[]>([]);

  userSettingsItems: UserSettingsItem[] = [];  

  selectedDevice = this.devices[0].name;

  checkBoxColor: ThemePalette = 'primary';

  newTableHeight: string;
  
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

    this.selectedAdditionalColumns$.subscribe(selectedValues => {

      var showPIDDecColumn = selectedValues.includes(1);
      this.pidDecColumnToggle = showPIDDecColumn ? true : false;

      var showPIDNameColumn = selectedValues.includes(2);
      this.pidNameColumnToggle = showPIDNameColumn ? true : false;

      var showP0NameColumn = selectedValues.includes(3);
      this.p0NameColumnToggle = showP0NameColumn ? true : false;
    });
  }

  async loadDataToTable(_linFrames: LinFrame[], option: number)
  {
    this.tableContainer = document.getElementById("tableContainer");
    this.table = document.getElementById("vertical_scroll_table");

    var lastTableRowOffsetTop = $('#vertical_scroll_table tr:last').offset().top;
    var autoScrollTriggerOffsetTop  = $("#autoScrollTrigger").offset().top;

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
      //Add in chunks
      case 0:

        var observableListLenght = this.linFramesObservableList$.getValue().length;
        var framesToAddLength = _linFrames.length;

        console.log("Row count: " + framesToAddLength);

        for(let i = observableListLenght; i < framesToAddLength; i++){

          const NEW_FRAMES = this.linFramesObservableList$.value.concat(_linFrames[i]);
          this.linFramesObservableList$.next(NEW_FRAMES)          
        }

        if(this.devicesComponentState.alwaysScrollToBottom)
        {
            this.ScrollBottom();
        } 

        break;

      //Load all data at once
      case 1:

        this.linFramesObservableList$.next(_linFrames);

        if(this.devicesComponentState.alwaysScrollToBottom)
        {
            this.ScrollBottom();
        } 

        break;
    }
  }

  ngOnDestroy() {

    this.removeUserFromSignalRGroup();
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
 
  clearTable()
  {
    this.linFramesObservableList = [];
    this.linFramesObservableList$.next(this.linFramesObservableList);
  }

  getSelectedAdditionalColumns()
  {
    this.selectedAdditionalColumns$.next(this.selectedAdditionalColumns);
  }

  toggleAutoscroll(event:MatCheckboxChange): void {
    this.devicesComponentState.alwaysScrollToBottom = event.checked;
  }

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
 
  ScrollBottom()
  {
    setTimeout(() => {
      this.virtualScroll.scrollTo({
        bottom: 0,
        behavior: 'auto',
      });
    }, 50);
    setTimeout(() => {
      this.virtualScroll.scrollTo({
        bottom: 0,
        behavior: 'auto',
      });
    }, 100);
  }

  //Component state functions
  initComponentState()
  {
    this.devicesComponentState = new DevicesComponentState();

    //Set default properties
    this.devicesComponentState.deviceConnected = false;
    this.devicesComponentState.deviceId = "ESP32SIM1";
    this.devicesComponentState.sessionIds = [];
    this.devicesComponentState.alwaysScrollToBottom = false;
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
