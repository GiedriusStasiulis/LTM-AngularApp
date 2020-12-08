import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MsalService } from '@azure/msal-angular';
import { CustomByteNamingItem } from '../models/customByteNamingItem';
import { SettingsDataService } from '../services/settings-data/settings-data.service';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {

  action:string;
  local_data:any;

  showInput: boolean;
  saveInProgress: boolean;
  saveResult: boolean;
  saveOK: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>, private _settingsDataService: SettingsDataService, private _authService: MsalService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CustomByteNamingItem) {
    this.local_data = {...data};
    this.action = this.local_data.action;
    
    this.showInput = true;
    this.saveInProgress = false;
    this.saveOK = false;
    this.saveResult = false;
  }

  doAction(arg: any){

    console.log("Argument: " + arg);

    this.showInput = false;
    this.saveInProgress = true;

    if(arg == "Add" || arg == "Update")
    {
      const CUSTOM_BYTE_NAMING_ITEM: CustomByteNamingItem = {
        id: this.local_data.id,
        UserID: this._authService.getAccount().accountIdentifier,
        PIDHexValue: this.local_data.PIDHexValue,
        PIDName: this.local_data.PIDName,
        Payload0Name: this.local_data.Payload0Name
      };

      this._settingsDataService.saveCustomByteNames(CUSTOM_BYTE_NAMING_ITEM).subscribe(results => {
        console.log("Results: " + JSON.stringify(results));

        //Then show saved result
        this.saveInProgress = false;
        this.saveResult = true;
        this.saveOK = true;

        if(this.saveOK)
        {
          this.dialogRef.close({event:this.action,data:this.local_data});
        }
      },
        err => {
          console.log("Error: " + JSON.stringify(err));

          //Show error while saving
          this.saveInProgress = false;
          this.saveResult = true;
          this.saveOK = false;
          //Click OK to close
          //this.dialogRef.close({event:"Error"});
        }      
      );   
    }
    else if(arg == "Delete")
    {

    }    
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }
}
