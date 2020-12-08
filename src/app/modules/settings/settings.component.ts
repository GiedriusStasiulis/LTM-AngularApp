import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MsalService } from '@azure/msal-angular';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';
import { SettingsComponentState } from 'src/app/models/component-states/settings-state';
import { ComponentStateService } from 'src/app/services/component-state-service/component-state.service';
import { DialogBoxComponent } from '../../dialog-box/dialog-box.component';
import { CustomByteNamingItem } from '../../models/customByteNamingItem';
import { SettingsDataService } from '../../services/settings-data/settings-data.service';

const ELEMENT_DATA: CustomByteNamingItem[] = [
  {id: "1560608769632", PIDHexValue: '0x01', PIDName: 'Battery 1 command', Payload0Name: "Charge"},
  {id: "1560608796014", PIDHexValue: '0x02', PIDName: 'Battery 1 status', Payload0Name: "Something"},
  {id: "1560608787815", PIDHexValue: '0x03', PIDName: 'Battery 2 command', Payload0Name: "Something"},
];

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit{

  displayedColumns: string[] = ['PIDHexValue', 'PIDName', 'Payload0Name','Action'];
  dataSource = ELEMENT_DATA;

  @ViewChild(MatTable,{static:true}) table: MatTable<any>;

  //Component variables
  settingsComponentState: SettingsComponentState;

  constructor(public dialog: MatDialog, private _componentStateService: ComponentStateService) {}

  ngOnInit(): void {
    //this.saveCustomByteNames();
    this.initComponentState();
  }

  openDialog(action,obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '280px',
      height: '400px',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        this.addRowData(result.data);
      }else if(result.event == 'Update'){
        this.updateRowData(result.data);
      }else if(result.event == 'Delete'){
        this.deleteRowData(result.data);
      }else if(result.event == 'Error')
      {
        //Do nothing
      }
    });
  }

  addRowData(row_obj){
    var d = new Date();
    this.dataSource.push({
      id:d.getTime().toString(),
      PIDHexValue:row_obj.PIDHexValue,
      PIDName:row_obj.PIDName,
      Payload0Name:row_obj.Payload0Name,
    });
    this.table.renderRows();        
  }
  
  updateRowData(row_obj){
    this.dataSource = this.dataSource.filter((value)=>{
      if(value.id == row_obj.id){
        value.PIDHexValue = row_obj.PIDHexValue;
        value.PIDName = row_obj.PIDName;
        value.Payload0Name = row_obj.Payload0Name;
      }
      return true;
    });    
  }

  deleteRowData(row_obj){
    this.dataSource = this.dataSource.filter((value)=>{
      return value.id != row_obj.id;
    });    
  }

  /*saveCustomByteNames()
  {
    const CUSTOM_BYTE_NAMING_WRAPPER: CustomByteNamesWrapper = {
      id: this.settingsComponentState.userId,
      CustomByteNameItems: this.dataSource
    };

    this._settingsDataService.saveCustomByteNames(CUSTOM_BYTE_NAMING_WRAPPER).subscribe(results => {
      console.log("Results: " + JSON.stringify(results));
    },
      err => {
        console.log("Error: " + JSON.stringify(err));
      }      
    );    
  }*/

  //Component state functions
  initComponentState()
  {
    this.settingsComponentState = new SettingsComponentState();

    //Set default properties
    /*this.settingsComponentState.userId = this._authService.getAccount().accountIdentifier;
    this.settingsComponentState.settingsChanged = false;
    this.settingsComponentState.settingsSaved = false;*/
  }

  saveComponentState(_settingsComponentState: SettingsComponentState)
  {
    this._componentStateService.saveComponentState(ComponentStateType.SettingsComponentState, _settingsComponentState);
  }

  loadComponentState()
  {
    this.settingsComponentState = this._componentStateService.loadComponentState(ComponentStateType.SettingsComponentState);
  }
}
