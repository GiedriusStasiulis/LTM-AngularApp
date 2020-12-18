import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { COLUMNS } from 'src/app/appdata/columns';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';
import { MonitoringTableviewState } from 'src/app/models/component-states/monitoring-tableview-state';
import { LinFrame } from 'src/app/models/data/linFrame';
import { ComponentStateService } from 'src/app/services/component-state-service/component-state.service';
import { MonitoringTableviewLogicService } from 'src/app/services/logic/monitoring-tableview-logic/monitoring-tableview-logic.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';

@Component({
  selector: 'app-monitoring-tableview',
  templateUrl: './monitoring-tableview.component.html',
  styleUrls: ['./monitoring-tableview.component.css'],
  providers: [MonitoringTableviewLogicService]
})
export class MonitoringTableviewComponent implements OnInit {

  private readonly _destroyed$ = new Subject<void>();

  //Component variables
  devicesComponentState: MonitoringTableviewState;

  devices = [
        { id: 1, name: 'ESP32SIM1' },
        { id: 2, name: 'ESP32DEV1' }
  ];
  selectedDeviceId$ = new Subject<string>();

  checkBoxColor: ThemePalette = 'primary';

  //Table variables
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  linFramesObservableList$ = new BehaviorSubject<LinFrame[]>([]);

  connectionButtonDisabled: boolean = true;
  selectDeviceIdInputDisabled: boolean = false;

  headers:any = COLUMNS;

  showDecimal: boolean = false;
  showSignalNames: boolean = false;

  constructor(private _signalRService: SignalRService, 
              private _componentStateService: ComponentStateService, 
              private _monitoringTableviewLogicService: MonitoringTableviewLogicService)
  { 
    this.headers = COLUMNS;
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
    this.showDecimal = this.devicesComponentState.showDecimalValues;
    this.showSignalNames = this.devicesComponentState.showSignalNames;

    this.selectedDeviceId$.next(this.devicesComponentState.selectedDeviceId);

    this._monitoringTableviewLogicService.frameDatalist$.subscribe(async frames => {

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

  toggleShowDecimalValues(event:MatCheckboxChange): void {
    this.devicesComponentState.showDecimalValues = event.checked;
    this.showDecimal = this.devicesComponentState.showDecimalValues;
    this.saveComponentState(this.devicesComponentState);
  }

  toggleShowSignalNames(event:MatCheckboxChange): void {
    this.devicesComponentState.showSignalNames = event.checked;
    this.showSignalNames = this.devicesComponentState.showSignalNames;
    this.saveComponentState(this.devicesComponentState);
  }

  onKeyUp(event: { target: { value: string; }; }) 
  {
    this._monitoringTableviewLogicService.filterText$.next(event.target.value);

    this._monitoringTableviewLogicService.frameDatalist$.subscribe(frames => {
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

  //Component state functions
  initComponentState()
  {
    this.devicesComponentState = new MonitoringTableviewState();

    //Set default properties
    this.devicesComponentState.selectedDeviceId = null;
    this.devicesComponentState.deviceConnected = false;    
    this.devicesComponentState.alwaysScrollToBottom = true;
    this.devicesComponentState.showDecimalValues = false;
    this.devicesComponentState.showSignalNames = true;
    this.devicesComponentState.deviceStatusText = "- - -";
  }

  saveComponentState(_deviceComponentState: MonitoringTableviewState)
  {
    this._componentStateService.saveComponentState(ComponentStateType.MonitoringTableviewState, _deviceComponentState);
  }

  loadComponentState()
  {
    this.devicesComponentState = this._componentStateService.loadComponentState(ComponentStateType.MonitoringTableviewState);
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
