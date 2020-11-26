import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LinFrame } from '../../models/linFrame'
import { MatSort } from '@angular/material/sort';
import { SubSink } from 'subsink/dist/subsink';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { DeviceTabState } from '../../models/deviceTabState'

const ELEMENT_DATA: LinFrame[] = [];

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit, AfterViewInit {

  //Table variables
  @ViewChild(MatSort) sort: MatSort;
  //@ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  //container: HTMLElement;  
  container: HTMLElement;
  scrollContainer: any;
  dataSource: MatTableDataSource<LinFrame>;
  displayedColumns: string[] = ['packetNo','frameNo', 'pidHex', 'pidDec', 'payload0', 'payload1', 'payload2', 'payload3', 'payload4', 'payload5', 'payload6', 'payload7'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  selectedRow : boolean;  

  //Tab variables
  tabGroupSubscription: any;
  deviceIdTab: string;
  deviceTabState: DeviceTabState = new DeviceTabState();
  deviceTabs: string[] = [];
  selected = new FormControl(0);

  //SignalR variables
  subSinkSubscription = new SubSink();
  signalRServiceStarted: boolean = false;
  messages: string[] = [];

  //Other variables
  timestamp: string = ''; 

  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _signalRService: SignalRService) 
  {
    this.subSinkSubscription.sink = this._signalRService.messageObservable$.subscribe(async message => {

      var elementsToPush: LinFrame[] = this.parseFramePacket(JSON.parse(message));

      console.log("Elements to push: " + elementsToPush);

      //ELEMENT_DATA.push(elementsToPush);
      for(let i = 0; i < elementsToPush.length; i++)
      {
        ELEMENT_DATA.push(elementsToPush[i]);
        this.dataSource = new MatTableDataSource(ELEMENT_DATA);
        this.scrollTableToBottom();
        await this.delay(5);
      }      
    });      
  }  
  
  ngOnInit() 
  {   
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
    this.dataSource.sort = this.sort;

    /*
    var loadedTabs = sessionStorage.getItem("savedTabs");

    if(loadedTabs != null)
    {
      //console.log(loadedTabs);
      this.deviceTabs = JSON.parse(loadedTabs);
    }    

    this.tabGroupSubscription = this._activatedRoute.params.subscribe(params => {
        
      this.deviceIdTab = params['id'];

      this.dataSource = new MatTableDataSource(ELEMENT_DATA);
      this.dataSource.sort = this.sort;

      if(!this.deviceTabs.includes(this.deviceIdTab))
      {
        this.deviceTabs.push(this.deviceIdTab);
        this.selected.setValue(this.deviceTabs.length - 1);
        this.initDeviceTabState(this.deviceIdTab);

        sessionStorage.setItem("savedTabs", JSON.stringify(this.deviceTabs));
      }

      else
      {
        this.selected.setValue(this.deviceTabs.indexOf(this.deviceIdTab));
        this.loadDeviceTabState(this.deviceIdTab);
      }    
    });    */
  }

  onTabChange(_event: { tab: { textLabel: string; }; }) 
  {
    this.saveDeviceTabState(this.deviceTabState);
    this._router.navigate([`/devices/${_event.tab.textLabel}`]); 
  }

  initDeviceTabState(_deviceId : string)
  {
    this.deviceTabState.deviceId = _deviceId;
    this.deviceTabState.deviceConnected = false;

    this.saveDeviceTabState(this.deviceTabState);
  }

  saveDeviceTabState(_deviceTabState : DeviceTabState)
  {
    sessionStorage.setItem(`${_deviceTabState.deviceId}_tabState`, JSON.stringify(_deviceTabState));
  }

  loadDeviceTabState(_deviceId : string)
  {
    var loadedDeviceTabState = sessionStorage.getItem(`${_deviceId}_tabState`);
    let obj: DeviceTabState = JSON.parse(loadedDeviceTabState);

    this.deviceTabState = obj;

    this.saveDeviceTabState(this.deviceTabState);
  }  

  saveComponentState()
  {

  }

  loadComponentState()
  {

  }

  async addUserToSignalRGroup()
  {
    const _deviceId = "ESP32_SIM1";

    (await this._signalRService.addUserToSignalRGroup(_deviceId)).subscribe(results => {
        console.log("Results: " + JSON.stringify(results));

        this.deviceTabState.deviceConnected = true;
        this._signalRService.addDeviceConnection();
        this.saveDeviceTabState(this.deviceTabState);
      },
        err => {
          console.log("Error: " + JSON.stringify(err));
        }      
      );
  }

  async removeUserFromSignalRGroup()
  {    
    const _deviceId = "ESP32_SIM1";   

    (await this._signalRService.removeUserFromSignalRGroup(_deviceId)).subscribe(results => {
      console.log("Results: " + JSON.stringify(results));

      this.deviceTabState.deviceConnected = false;
      this._signalRService.removeDeviceConnection();      
      this.saveDeviceTabState(this.deviceTabState);
    },
      err => {
        console.log("Error: " + JSON.stringify(err));
      }      
    );   
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

  getCurrentDateTime(): string
  {
    let dTimeNow = new Date().toLocaleString();
    return dTimeNow;
  }
  
  ngAfterViewInit() 
  {    
    if(this.deviceTabState.deviceConnected)
    {
      this.dataSource.sort = this.sort;
    }   
  }

  ngOnDestroy() {
    this.saveDeviceTabState(this.deviceTabState);
    this.tabGroupSubscription.unsubscribe();
  }

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

  scrollTableToBottom()
  {
    this.container = document.getElementById("frameTable");           
    this.container.scrollTop = this.container.scrollHeight;
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
