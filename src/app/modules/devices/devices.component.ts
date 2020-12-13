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
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import * as _ from 'lodash';

let $ = require('../../../../node_modules/jquery/dist/jquery.min.js');

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {

  //Component variables
  devicesComponentState: DevicesComponentState;

  devices = [
        { id: 1, name: 'ESP32SIM1' },
        { id: 2, name: 'ESP32DEV1' }
  ];
  selectedDeviceId$ = new Subject<string>();

  checkBoxColor: ThemePalette = 'primary';

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
  selectedAdditionalColumns$ = new BehaviorSubject<number[]>([]);
  pidDecColumnToggle: boolean;
  pidNameColumnToggle: boolean;
  p0NameColumnToggle: boolean;

  filterColumns = [
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
  selectedFilterColumn$ = new Subject<string>();
  
  //Table variables
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  displayedColumns: string[] = ['sessionId','packetNo','frameNo', 'pidHex', 'pidDec', 'pidName', 'payload0', 'payload0Name', 'payload1', 'payload2', 'payload3', 'payload4', 'payload5', 'payload6', 'payload7'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  //Subscription
  userSettingsSub = new SubSink();
  linframesDataServiceSub = new SubSink();
  selectedAdditionalColumnsSub = new SubSink();
  filterTextSub = new SubSink();

  linFramesObservableList: LinFrame[] = [];
  linFramesObservableList$ = new BehaviorSubject<LinFrame[]>([]);
  linFramesObservableListFiltered$ = new BehaviorSubject<LinFrame[]>([]);

  userSettingsItems: UserSettingsItem[] = [];  
  connectionButtonDisabled: boolean = true;
  selectDeviceIdInputDisabled: boolean = false;

  filterEnabled: boolean = false
  filterText: string = "";

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
      //New component instance
      this.initComponentState();
    }    

    this.selectDeviceIdInputDisabled = this.devicesComponentState.deviceConnected ? true : false;
    this.connectionButtonDisabled = this.devicesComponentState.selectedDeviceId ? false : true;

    this.selectedDeviceId$.next(this.devicesComponentState.selectedDeviceId);
    this.selectedAdditionalColumns$.next(this.devicesComponentState.selectedAdditionalColumns);
    this.selectedFilterColumn$.next(this.devicesComponentState.selectedFilterColumn);

    this.userSettingsSub.sink = this._settingsDataService.getAllUserSettings(this.getLoggedInAccountID()).subscribe(    
      userSettingsItems => {    
        this.userSettingsItems = userSettingsItems; 
      },    
      error => console.log(error)   
    ); 

    this.linframesDataServiceSub.sink = this._linframesDataService.linFramesList$.subscribe(async frames => {
      
      this.linFramesObservableList = frames;
      console.log("LinFrames length: " + this.linFramesObservableList.length)
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

    this.selectedAdditionalColumnsSub.sink = this.selectedAdditionalColumns$.subscribe(selectedValues => {

      this.pidDecColumnToggle = selectedValues.includes(1) ? true : false;
      this.pidNameColumnToggle = selectedValues.includes(2) ? true : false;
      this.p0NameColumnToggle = selectedValues.includes(3) ? true : false;      
    });
  }

  async loadDataToTable(_linFrames: LinFrame[], option: number)
  {
    console.log("Frames to be added: " + _linFrames.length);

    this.userSettingsItems.forEach(element => {
      let itemIndex = _linFrames.findIndex(r => r.PID_HEX === element.pidHexValue);

      //Signal PID Hex value exists in user settings
      if(itemIndex != -1)
      {
        _linFrames[itemIndex].PID_Name = element.pidName;
        _linFrames[itemIndex] = _linFrames[itemIndex];
      }
    });

    //Ideally here
    if(this.filterEnabled)
    {
      _linFrames = _linFrames.filter(item =>
        Object.keys(item).some(
          k =>
            item[k] != null &&
            item[k]
              .toString()
              .toLowerCase()
              .includes(this.filterText.toLowerCase())
        )
      );
    }

    switch(option)
    {
      //Add in chunks
      case 0:

        var observableListLenght = this.linFramesObservableList$.getValue().length;
        var framesToAddLength = _linFrames.length;

        for(let i = observableListLenght; i < framesToAddLength; i++){

          const NEW_FRAMES = this.linFramesObservableList$.value.concat(_linFrames[i]);
          this.linFramesObservableList$.next(NEW_FRAMES)          
        }

        if(this.devicesComponentState.alwaysScrollToBottom)
        {
            this.scrollToBottom();
        } 

        break;

      //Load all data at once
      case 1:

        this.linFramesObservableList$.next(_linFrames);

        if(this.devicesComponentState.alwaysScrollToBottom)
        {
            this.scrollToBottom();
        } 

        break;
    }
  }

  //SignalR Service functions
  addUserToSignalRGroup()
  {
    this.devicesComponentState.deviceStatusText = "Connecting..."

    this._signalRService.addUserToSignalRGroup(this.devicesComponentState.selectedDeviceId).subscribe(results => {
        console.log("Results: " + JSON.stringify(results));
        
        this.devicesComponentState.deviceConnected = true;
        this.selectDeviceIdInputDisabled = true;
        this.devicesComponentState.deviceStatusText = "Connected";
        this.saveComponentState(this.devicesComponentState);
      },
        err => {
          console.log("Error: " + JSON.stringify(err));
          this.devicesComponentState.deviceStatusText = "Error!"
          this.saveComponentState(this.devicesComponentState); 
        }      
      );
  }

  removeUserFromSignalRGroup()
  {    
    this.devicesComponentState.deviceStatusText = "Disconnecting..."

    this._signalRService.removeUserFromSignalRGroup(this.devicesComponentState.selectedDeviceId).subscribe(results => {
      console.log("Results: " + JSON.stringify(results));
      
      this.devicesComponentState.deviceConnected = false;   
      this.selectDeviceIdInputDisabled = false;
      this.devicesComponentState.deviceStatusText = "Disconnected";
      this.saveComponentState(this.devicesComponentState);      
    },
      err => {
        console.log("Error: " + JSON.stringify(err));
        this.devicesComponentState.deviceStatusText = "Error!"
        this.saveComponentState(this.devicesComponentState); 
      }      
    );   
  }

  //Table functions
 
  clearTable()
  {
    this.linFramesObservableList = [];
    this.linFramesObservableList$.next(this.linFramesObservableList);
  }

  getSelectedDeviceId()
  {
    var deviceIdNull = this.devicesComponentState.selectedDeviceId ? false : true;
    this.connectionButtonDisabled = deviceIdNull ? true : false;

    this.selectedDeviceId$.next(this.devicesComponentState.selectedDeviceId);
    this.saveComponentState(this.devicesComponentState);
  }

  getSelectedAdditionalColumns()
  {
    this.selectedAdditionalColumns$.next(this.devicesComponentState.selectedAdditionalColumns);
    this.saveComponentState(this.devicesComponentState);
  }

  getSelectedFilterColumn()
  {
    this.selectedFilterColumn$.next(this.devicesComponentState.selectedFilterColumn);
    this.saveComponentState(this.devicesComponentState);
  }

  onKeyUp(event: { target: { value: string; }; }) 
  {
    this.filterText = event.target.value;
    this.filterEnabled = event.target.value.length > 0 ? true : false;

    this._linframesDataService.linFramesList$.subscribe(frames => {

      this.linFramesObservableList = frames.filter(item =>
        Object.keys(item).some(
          k =>
            item[k] != null &&
            item[k]
              .toString()
              .toLowerCase()
              .includes(this.filterText.toLowerCase())
        )
      );
    });

    this.linFramesObservableList$.next(this.linFramesObservableList);
  }

  toggleAutoscroll(event:MatCheckboxChange): void {
    this.devicesComponentState.alwaysScrollToBottom = event.checked;
    this.saveComponentState(this.devicesComponentState);
  }

  scrollToBottom()
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

  getLoggedInAccountID()
  {
    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);

    return accInfo.localAccountId;
  }

  //Component state functions
  initComponentState()
  {
    this.devicesComponentState = new DevicesComponentState();

    //Set default properties
    this.devicesComponentState.selectedDeviceId = null;
    this.devicesComponentState.deviceConnected = false;    
    this.devicesComponentState.alwaysScrollToBottom = false;
    this.devicesComponentState.selectedAdditionalColumns = [];
    this.devicesComponentState.deviceStatusText = "- - -";
    this.devicesComponentState.selectedFilterColumn = [];
  }

  saveComponentState(_deviceComponentState: DevicesComponentState)
  {
    this._componentStateService.saveComponentState(ComponentStateType.DevicesComponentState, _deviceComponentState);
  }

  loadComponentState()
  {
    this.devicesComponentState = this._componentStateService.loadComponentState(ComponentStateType.DevicesComponentState);
  }

  ngOnDestroy() {

    this.userSettingsSub.unsubscribe();
    this.linframesDataServiceSub.unsubscribe();
    this.selectedAdditionalColumnsSub.unsubscribe();
    
    this.saveComponentState(this.devicesComponentState);    
  }
}