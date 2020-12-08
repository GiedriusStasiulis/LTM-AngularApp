import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LinFrame } from '../../models/linFrame'
import { MatSort } from '@angular/material/sort';
import { SubSink } from 'subsink/dist/subsink';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ComponentStateService } from '../../services/component-state-service/component-state.service';
import { DevicesComponentState } from 'src/app/models/component-states/devices-state';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';

const ELEMENT_DATA: LinFrame[] = [];

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit, AfterViewInit {

  //Table variables
  @ViewChild(MatSort) sort: MatSort;
  tableScrollContainer: HTMLElement;
  dataSource: MatTableDataSource<LinFrame>;
  displayedColumns: string[] = ['packetNo','frameNo', 'pidHex', 'pidDec', 'payload0', 'payload1', 'payload2', 'payload3', 'payload4', 'payload5', 'payload6', 'payload7'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  selectedRow : boolean;  

  //SignalR variables
  subSinkSubscription = new SubSink();
  signalRServiceStarted: boolean = false;
  messages: string[] = [];

  //Component variables
  devicesComponentState: DevicesComponentState;

  //Other variables
  timestamp: string = ''; 

  devices = [
        { id: 1, name: 'ESP32_SIM1' },
        { id: 2, name: 'ESP32_DEV1' }
    ];

  selectedDevice = this.devices[0];

  constructor(private _signalRService: SignalRService, private _componentStateService: ComponentStateService) 
  {
    this.subSinkSubscription.sink = this._signalRService.messageObservable$.subscribe(async message => {

      var elementsToPush: LinFrame[] = this.parseFramePacket(JSON.parse(message));

      for(let i = 0; i < elementsToPush.length; i++)
      {
        ELEMENT_DATA.push(elementsToPush[i]);        
        this.dataSource = new MatTableDataSource(ELEMENT_DATA);
        this.scrollTableToBottom();
        await this.delay(5);
      }      
    });      

    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
    this.dataSource.sort = this.sort;    
  }  
  
  ngOnInit() 
  {   
    this.loadComponentState();

    if(this.devicesComponentState == null)
    {
      this.initComponentState();
    }    
  }

  ngAfterViewInit() 
  {    
    if(this.devicesComponentState.deviceConnected)
    {
      this.dataSource.sort = this.sort;
    } 
  }

  ngOnDestroy() {
    this.saveComponentState(this.devicesComponentState);
  }



  //SignalR Service functions
  addUserToSignalRGroup()
  {
    this._signalRService.addUserToSignalRGroup(this.devicesComponentState.deviceId).subscribe(results => {
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
    this._signalRService.removeUserFromSignalRGroup(this.devicesComponentState.deviceId).subscribe(results => {
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
  scrollTableToBottom()
  {
    this.tableScrollContainer = document.getElementById("frameTable");           
    this.tableScrollContainer.scrollTop = this.tableScrollContainer.scrollHeight;
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

  applyFilter(_event: Event) {
    const filterValue = (_event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  
  
  //Data functions
  parseFramePacket(message: any)
  {
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
    this.devicesComponentState.deviceConnected = false;
    this.devicesComponentState.deviceId = "ESP32_SIM1";
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
