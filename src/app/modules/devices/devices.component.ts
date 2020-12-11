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

  displayedColumns: string[] = ['packetNo','frameNo', 'pidHex', 'pidDec', 'pidName', 'payload0', 'payload0Name', 'payload1', 'payload2', 'payload3', 'payload4', 'payload5', 'payload6', 'payload7'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  selectedRow : boolean;  

  alwaysScrollToBottom: boolean;

  //Subscription
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

  //observableData = new BehaviorSubject<number[]>([]);
  linFramesObservableList = new BehaviorSubject<LinFrame[]>([]);

  selectedDevice = this.devices[0].name;

  constructor(private _signalRService: SignalRService, private _componentStateService: ComponentStateService, private _linframesDataService: LinframesDataService) 
  {  }  
  
  ngOnInit() 
  {   
    this.loadComponentState();

    if(this.devicesComponentState == null)
    {
      //New component instance, fresh browser open
      this.initComponentState();
    }    

    //Check if sessionStorage contains session ids

    if(this.devicesComponentState.deviceConnected)
    {
      //Fetch previous frames for current session before appending live frames?
    }

    //One sub to push frames to linframes-data.service
    this.signalRMessagesSub.sink = this._signalRService.messageObservable$.subscribe(async message => {

      var elementsToPush: LinFrame[] = this.parseFramePacket(JSON.parse(message));
      this._linframesDataService.pushFramesToObservable(elementsToPush);
    }); 

    //Second one to observe the frames in linframes-data.service
    this.linframesDataServiceSub.sink = this._linframesDataService.linFramesList$.subscribe(async frames => {

      var framesToLoad: LinFrame[] = frames;
      this.showDataInTable(framesToLoad);
    });    
  }

  /*ngAfterViewInit() 
  {    
    if(this.devicesComponentState.deviceConnected)
    {
      this.dataSource.sort = this.sort;
    } 
  }*/

  ngOnDestroy() {
    this.saveComponentState(this.devicesComponentState);
    this.signalRMessagesSub.unsubscribe();
  }

  //SignalR Service functions
  addUserToSignalRGroup()
  {
    this._signalRService.addUserToSignalRGroup("ESP32SIM1").subscribe(results => {
        console.log("Results: " + JSON.stringify(results));
        
        this._signalRService.addDeviceConnection();
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
    this._signalRService.removeUserFromSignalRGroup(this.selectedDevice).subscribe(results => {
      console.log("Results: " + JSON.stringify(results));
      
      this._signalRService.removeDeviceConnection();   
      this.devicesComponentState.deviceConnected = false;   
      this.saveComponentState(this.devicesComponentState);
    },
      err => {
        console.log("Error: " + JSON.stringify(err));
      }      
    );   
  }

  //Table functions
  async showDataInTable(_linFrames: LinFrame[])
  {
    this.tableContainer = document.getElementById("tableContainer");
    this.table = document.getElementById("vertical_scroll_table");

    for(let i = 0; i < _linFrames.length; i++)
    {
      const NEW_FRAMES = this.linFramesObservableList.value.concat(_linFrames[i]);
      this.linFramesObservableList.next(NEW_FRAMES);

      if(this.devicesComponentState.alwaysScrollToBottom)
      {
        if(this.table.scrollHeight > this.tableContainer.clientHeight)
        {
          this.tableContainer.scrollTop = this.tableContainer.scrollHeight;
        }          
      }

      await this.delay(0.5);
    }

    this.tableContainer.scrollTop = this.tableContainer.scrollHeight;
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

  //Data functions
  parseFramePacket(message: any)
  {
    //Get sessionID
    if(message.PCKNO == 1)
    {
      this.devicesComponentState.sessionIds.push(message.DEVID);
      this.saveComponentState(this.devicesComponentState);
      console.log(this.devicesComponentState.sessionIds.forEach);      
    }

    const LIN_FRAMES: LinFrame[] = [];

    for(let i = 0; i < Object.keys(message.FRAMES).length; i++)
    {      
      const payloadArr = message.FRAMES[i].FDATA.split(/[ ]+/);

      const FRAME: LinFrame = {
        PCKNO: message.PCKNO,
        FNO: message.FRAMES[i].FNO,
        PID_HEX: payloadArr[0],
        PID_DEC: parseInt(payloadArr[0], 16),
        FDATA0: payloadArr[1],
        FDATA1: payloadArr[2],
        FDATA2: payloadArr[3],
        FDATA3: payloadArr[4],
        FDATA4: payloadArr[5],
        FDATA5: payloadArr[6],
        FDATA6: payloadArr[7],
        FDATA7: payloadArr[8],
      };

      LIN_FRAMES.push(FRAME);
    }

    return LIN_FRAMES;
  }

  

  //Component state functions
  initComponentState()
  {
    this.devicesComponentState = new DevicesComponentState();

    //Set default properties
    this.devicesComponentState.deviceConnected = true;
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
