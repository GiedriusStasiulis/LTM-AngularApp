import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { DialogBoxComponent } from '../../dialog-box/dialog-box.component';

export interface CustomByteName {
  id: number;
  byte_name: string;
  hex_value: string;
  custom_name: string;
}

const ELEMENT_DATA: CustomByteName[] = [
  {id: 1560608769632, byte_name: 'PID', hex_value: '0x01', custom_name: 'CustomName1'},
  {id: 1560608796014, byte_name: 'Payload[0]', hex_value: '0x61', custom_name: 'CustomName2'},
  {id: 1560608787815, byte_name: 'PID', hex_value: '0x02', custom_name: 'CustomName3'},
];

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent{

  displayedColumns: string[] = ['byte_name', 'hex_value', 'custom_name', 'action'];
  dataSource = ELEMENT_DATA;

  @ViewChild(MatTable,{static:true}) table: MatTable<any>;

  constructor(public dialog: MatDialog) {}

  openDialog(action,obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '300px',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        this.addRowData(result.data);
      }else if(result.event == 'Update'){
        this.updateRowData(result.data);
      }else if(result.event == 'Delete'){
        this.deleteRowData(result.data);
      }
    });
  }

  addRowData(row_obj){
    var d = new Date();
    this.dataSource.push({
      id:d.getTime(),
      byte_name:row_obj.byte_name,
      hex_value:row_obj.hex_value,
      custom_name:row_obj.custom_name
    });
    this.table.renderRows();    
  }
  
  updateRowData(row_obj){
    this.dataSource = this.dataSource.filter((value,key)=>{
      if(value.id == row_obj.id){
        value.byte_name = row_obj.byte_name;
        value.hex_value = row_obj.hex_value;
        value.custom_name = row_obj.custom_name;
      }
      return true;
    });
  }

  deleteRowData(row_obj){
    this.dataSource = this.dataSource.filter((value,key)=>{
      return value.id != row_obj.id;
    });
  }

}
