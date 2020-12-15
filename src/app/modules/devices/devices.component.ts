import { AfterViewChecked, Component, OnInit, ViewChild } from '@angular/core';
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
import { remove } from 'lodash';
import * as JSLZString from 'lz-string';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit, AfterViewChecked {

  //Component variables
  devicesComponentState: DevicesComponentState;

  devices = [
        { id: 1, name: 'ESP32SIM1' },
        { id: 2, name: 'ESP32DEV1' }
  ];
  selectedDeviceId$ = new Subject<string>();

  checkBoxColor: ThemePalette = 'primary';

  additionalColumns = [
    COLUMNS[4],
    COLUMNS[5],
    COLUMNS[7],
    COLUMNS[9],
    COLUMNS[11],
    COLUMNS[13],
    COLUMNS[15],
    COLUMNS[17],
    COLUMNS[19],
    COLUMNS[21],
  ];

  emptyLinFrame: LinFrame[] = [{SessionID: "undefined", PCKNO: -1, FNO: -1, PID_HEX: "", PID_DEC: -1, FDATA0: "undefined", FDATA1: "undefined", FDATA2: "undefined", FDATA3: "undefined", FDATA4: "undefined", FDATA5: "undefined", FDATA6: "undefined", FDATA7: "undefined" }];

  selectedAdditionalColumns$ = new BehaviorSubject<number[]>([]);
  columnCount$ = new BehaviorSubject<number>(null);
  pidDecColumnToggle: boolean;
  pidNameColumnToggle: boolean;
  p0NameColumnToggle: boolean;
  p1NameColumnToggle: boolean;
  p2NameColumnToggle: boolean;
  p3NameColumnToggle: boolean;
  p4NameColumnToggle: boolean;
  p5NameColumnToggle: boolean;
  p6NameColumnToggle: boolean;
  p7NameColumnToggle: boolean;

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
              private _linframesDataService: LinframesDataService,
              private _settingsDataService: SettingsDataService) 
  { 
    this.headers = COLUMNS;
  }  

  ngAfterViewChecked(): void {

    this.columnCount$.subscribe(value => {
      this.count = value;
        this.setColumnHeaderWidth(value);
        this.setTableRowColumnWidth(value)
    });  

    //this.checkForScrollBar();
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
    this.selectedAdditionalColumns$.next(this.devicesComponentState.selectedAdditionalColumns);

    /*this.userSettingsSub.sink = this._settingsDataService.getAllUserSettings(this.getLoggedInAccountID()).subscribe(    
      userSettingsItems => {    
        this.userSettingsItems = userSettingsItems; 
      },    
      error => console.log(error)   
    ); */

    this.linframesDataServiceSub.sink = this._linframesDataService.linFramesList$.subscribe(async frames => {

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

    this.selectedAdditionalColumnsSub.sink = this.selectedAdditionalColumns$.subscribe(selectedValues => {

      this.columnCount$.next(12 + selectedValues.length);

      this.pidDecColumnToggle = selectedValues.includes(4) ? true : false;
      this.pidNameColumnToggle = selectedValues.includes(5) ? true : false;
      this.p0NameColumnToggle = selectedValues.includes(7) ? true : false;      
      this.p1NameColumnToggle = selectedValues.includes(9) ? true : false;      
      this.p2NameColumnToggle = selectedValues.includes(11) ? true : false;      
      this.p3NameColumnToggle = selectedValues.includes(13) ? true : false;      
      this.p4NameColumnToggle = selectedValues.includes(15) ? true : false;      
      this.p5NameColumnToggle = selectedValues.includes(17) ? true : false;      
      this.p6NameColumnToggle = selectedValues.includes(19) ? true : false;      
      this.p7NameColumnToggle = selectedValues.includes(21) ? true : false;      
    });
  }

  async loadDataToTable(_linFrames: LinFrame[], option: number)
  {
    //sessionStorage.setItem("LinFrames","");
    //console.log("Frames count: " + _linFrames.length); 

    //var framesCompressed = this._lz.compress(JSON.stringify(_linFrames));
    //var framesCompressed = JSLZString.compress(JSON.stringify(_linFrames));
    //sessionStorage.setItem("LinFrames", framesCompressed);
    //this.checkSessionStorageSize();


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

  toggleAutoscroll(event:MatCheckboxChange): void {
    this.devicesComponentState.alwaysScrollToBottom = event.checked;
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

  setColumnHeaderWidth(value: number)
  {
    const headerElements = document.getElementsByClassName("headerRowItem") as HTMLCollectionOf<HTMLElement>;
    
    for(let i = 0; i < headerElements.length; i++)
    {
      headerElements[i].style.minWidth = `calc(100% / ${value})`;
      headerElements[i].style.maxWidth = `calc(100% / ${value})`;
    }
  }

  setTableRowColumnWidth(value: number)
  {
    const columnElements = document.getElementsByClassName("scrollListItem") as HTMLCollectionOf<HTMLElement>;

    for(let i = 0; i < columnElements.length; i++)
    {
      columnElements[i].style.minWidth = `calc(100% / ${value})`;
      columnElements[i].style.maxWidth = `calc(100% / ${value})`;
    }
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
    this.devicesComponentState.selectedAdditionalColumns = this.additionalColumns;
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

  checkSessionStorageSize()
  {
    var limit = 1024 * 1024 * 5; //5 Mb
    var remSpace = limit - unescape(encodeURIComponent(JSON.stringify(sessionStorage))).length;

    console.log("SessionStorage limit: " + limit);
    console.log("Remaining sessionStorage space: " + remSpace);
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
  }
}