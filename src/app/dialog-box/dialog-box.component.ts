import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

export interface UsersData {
  name: string;
  id: number;
}

export interface CustomByteName {
  id: number;
  byte_name: string;
  hex_value: string;
  custom_name: string;
}

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {

  action:string;
  local_data:any;

  byte_names = [
    { id: 1, name: "PID"},
    { id: 2, name: "Payload[0]"},
    { id: 3, name: "Payload[1]"},
    { id: 4, name: "Payload[2]"},
    { id: 5, name: "Payload[3]"},
    { id: 6, name: "Payload[4]"},
    { id: 7, name: "Payload[5]"},
    { id: 8, name: "Payload[6]"},
    { id: 9, name: "Payload[7]"},
  ];

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CustomByteName) {
    console.log(data);
    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  doAction(){
    this.dialogRef.close({event:this.action,data:this.local_data});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
