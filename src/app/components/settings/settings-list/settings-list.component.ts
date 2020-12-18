import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';
import { SettingsComponentState } from 'src/app/models/component-states/settings-state';
import { UserSettingsItem } from 'src/app/models/data/userSettingsItem';
import { ComponentStateService } from 'src/app/services/component-state-service/component-state.service';
import { SettingsDataService } from '../../../services/data/settings-data/settings-data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css']
})

export class SettingsListComponent implements OnInit{

  pageTitle = 'Signal namings';    
  filteredUserSettingsItems: UserSettingsItem[] = [];    
  userSettingsItems: UserSettingsItem[] = [];    
  errorMessage = '';
  showSpinner: boolean;
  showSettingsTable: boolean;

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 25;
  diameter = 50;

  //Component variables
  settingsComponentState: SettingsComponentState;

  constructor(private _componentStateService: ComponentStateService, 
              private _settingsDataService: SettingsDataService) {}

  ngOnInit(): void {
    this.initComponentState();

    this.showSpinner = true;
    this.showSettingsTable = false;

    this._settingsDataService.getAllUserSettings(this.settingsComponentState.userId).subscribe(    
      userSettingsItems => {    

        this.showSpinner = false;
        this.showSettingsTable = true;

        this.userSettingsItems = userSettingsItems;    
        console.log(this.userSettingsItems);
        this.filteredUserSettingsItems = this.userSettingsItems;    
      },    
      error => this.errorMessage = <any>error   
    );      

    console.log("Error: " + this.errorMessage)
  }

  deleteUserSettingsItem(_settingsItemID: string, _userID: string): void {
    if(confirm(`Are you sure want to delete this setting: ${_settingsItemID}?`))
      {
        this._settingsDataService.deleteSettingsItem(_settingsItemID,_userID).subscribe(
          () => this.onSaveComplete(),    
            (error: any) => this.errorMessage = <any>error  
        );
      }
  }

  onSaveComplete(): void {
    this._settingsDataService.getAllUserSettings(this.settingsComponentState.userId).subscribe(    
      userSettingsItems => {    
        this.userSettingsItems = userSettingsItems;    
        this.filteredUserSettingsItems = this.userSettingsItems;    
      },    
      error => this.errorMessage = <any>error    
    );  
  }

  //Component state functions
  initComponentState()
  {
    this.settingsComponentState = new SettingsComponentState();

    //Set default properties
    this.settingsComponentState.userId = this.getLoggedInAccountID();
  }

  saveComponentState(_settingsComponentState: SettingsComponentState)
  {
    this._componentStateService.saveComponentState(ComponentStateType.SettingsComponentState, _settingsComponentState);
  }

  loadComponentState()
  {
    this.settingsComponentState = this._componentStateService.loadComponentState(ComponentStateType.SettingsComponentState);
  }

  getLoggedInAccountID()
  {
    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);

    return accInfo.localAccountId;
  }
}
