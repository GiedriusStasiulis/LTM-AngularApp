import { AfterViewChecked, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import * as _ from 'lodash';
import { COLUMNS } from "../../appdata/columns";
import { TableviewLogicService } from 'src/app/services/logic/tableview-logic/tableview-logic.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css'],
  providers: [TableviewLogicService]
})
export class DevicesComponent implements OnInit, AfterViewChecked, OnDestroy {

  private readonly _destroyed$ = new Subject<void>();

  //Component variables
  devicesComponentState: DevicesComponentState;

  devices = [
        { id: 1, name: 'ESP32SIM1' },
        { id: 2, name: 'ESP32DEV1' }
  ];
  selectedDeviceId$ = new Subject<string>();

  checkBoxColor: ThemePalette = 'primary';

  //Table variables
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

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

  headers:any = COLUMNS;

  count: number;

  constructor(private _signalRService: SignalRService, 
              private _componentStateService: ComponentStateService, 
              private _tableviewLogicService: TableviewLogicService,
              private _settingsDataService: SettingsDataService) 
  { 
    this.headers = COLUMNS;
  }  

  ngAfterViewChecked(): void {

  }

  ngOnInit() 
  { 
    this.loadComponentState();

    if(this.devicesComponentState == null)
    {
      //New component instance
      this.initComponentState();
    }    

    this.saveComponentState(this.devicesComponentState);

    this.selectDeviceIdInputDisabled = this.devicesComponentState.deviceConnected ? true : false;
    this.connectionButtonDisabled = this.devicesComponentState.selectedDeviceId ? false : true;

    this.selectedDeviceId$.next(this.devicesComponentState.selectedDeviceId);

    /*this.userSettingsSub.sink = this._settingsDataService.getAllUserSettings(this.getLoggedInAccountID()).subscribe(    
      userSettingsItems => {    
        this.userSettingsItems = userSettingsItems; 
      },    
      error => console.log(error)   
    );*/

    this._tableviewLogicService.frameDatalist$.subscribe(async frames => {

      this.linFramesObservableList = frames;
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
    //this.checkForScrollBar();

    /*this.userSettingsItems.forEach(element => {
      let itemIndex = _linFrames.findIndex(r => r.PID_HEX === element.pidHexValue);

      //Signal PID Hex value exists in user settings
      if(itemIndex != -1)
      {
        _linFrames[itemIndex].PID_Name = element.pidName;
        _linFrames[itemIndex].FDATA0_Name = element.payload0Name.length > 0 ? element.payload0Name : "---";
        _linFrames[itemIndex].FDATA1_Name = element.payload1Name.length > 0 ? element.payload1Name : "---";
        _linFrames[itemIndex].FDATA2_Name = element.payload2Name.length > 0 ? element.payload2Name : "---";
        _linFrames[itemIndex].FDATA3_Name = element.payload3Name.length > 0 ? element.payload3Name : "---";
        _linFrames[itemIndex].FDATA4_Name = element.payload4Name.length > 0 ? element.payload4Name : "---";
        _linFrames[itemIndex].FDATA5_Name = element.payload5Name.length > 0 ? element.payload5Name : "---";
        _linFrames[itemIndex].FDATA6_Name = element.payload6Name.length > 0 ? element.payload6Name : "---";
        _linFrames[itemIndex].FDATA7_Name = element.payload7Name.length > 0 ? element.payload7Name : "---";
        _linFrames[itemIndex] = _linFrames[itemIndex];
      }
    });*/

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

  async removeUserFromSignalRGroup()
  {    
    this.devicesComponentState.deviceStatusText = "Disconnecting..."

    ;(await this._signalRService.removeUserFromSignalRGroup()).subscribe(results => {
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
    this.linFramesObservableList$.next([]);
    //this._linframesDataService.clearFrames();
  }

  getSelectedDeviceId()
  {
    var deviceIdNull = this.devicesComponentState.selectedDeviceId ? false : true;
    this.connectionButtonDisabled = deviceIdNull ? true : false;

    this.selectedDeviceId$.next(this.devicesComponentState.selectedDeviceId);
    this.saveComponentState(this.devicesComponentState);
  }

  toggleAutoscroll(event:MatCheckboxChange): void {
    this.devicesComponentState.alwaysScrollToBottom = event.checked;
    this.saveComponentState(this.devicesComponentState);
  }

  onKeyUp(event: { target: { value: string; }; }) 
  {
    this.filterText = event.target.value;

    this._tableviewLogicService.filterText$.next(this.filterText);

    this._tableviewLogicService.frameDatalist$.subscribe(frames => {
      this.linFramesObservableList$.next(frames);
    });
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

  checkForScrollBar()
  {
    const containerOffset = document.getElementById("user_input_container").offsetTop;

    console.log(containerOffset);
  }

  //Component state functions
  initComponentState()
  {
    this.devicesComponentState = new DevicesComponentState();

    //Set default properties
    this.devicesComponentState.selectedDeviceId = null;
    this.devicesComponentState.deviceConnected = false;    
    this.devicesComponentState.alwaysScrollToBottom = false;
    this.devicesComponentState.deviceStatusText = "- - -";
  }

  saveComponentState(_deviceComponentState: DevicesComponentState)
  {
    this._componentStateService.saveComponentState(ComponentStateType.DevicesComponentState, _deviceComponentState);
  }

  loadComponentState()
  {
    this.devicesComponentState = this._componentStateService.loadComponentState(ComponentStateType.DevicesComponentState);
  }

  saveFrameDataToSessionStorage()
  {
    //this._linframesDataService.saveFramesToSessionStorage();
  }

  getLoggedInAccountID()
  {
    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);

    return accInfo.localAccountId;
  }

  ngOnDestroy()
  {
    this.saveComponentState(this.devicesComponentState);

    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}