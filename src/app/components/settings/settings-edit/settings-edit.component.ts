import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserSettingsItem } from 'src/app/models/data/userSettingsItem';
import { SettingsDataService } from 'src/app/services/data/settings-data/settings-data.service';
import { GenericValidator } from 'src/app/shared/genericvalidator';

@Component({
  selector: 'app-settings-edit',
  templateUrl: './settings-edit.component.html',
  styleUrls: ['./settings-edit.component.css']
})
export class SettingsEditComponent implements OnInit, OnDestroy {

  pageTitle = "";    
  errorMessage: string;    
  userSettingsItemForm: FormGroup;    
  tranMode: string;    
  userSettingsItem: UserSettingsItem; 
  userId: string;
  settingsId: string;
  private sub: Subscription;   

  displayMessage: { [key: string]: string } = {};    
  private validationMessages: { [key: string]: { [key: string]: string } };    
  genericValidator: GenericValidator;

  constructor(private _fb: FormBuilder, 
              private _route: ActivatedRoute, 
              private _router: Router, 
              private _settingsDataService: SettingsDataService) 
  {
    this.validationMessages = {    
      pidHexValue: {    
        required: 'PID Hex value is required.',    
        minlength: 'PID Hex value must be at least two numbers.',    
        maxlength: 'PID Hex value cannot exceed 50 characters.'      
      },
      pidName: {    
        required: 'PID Name value is required.',    
        minlength: 'PID Name must be at least three characters.',    
        maxlength: 'PID name cannot exceed 50 characters.'    
      },    
      payload0Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      payload1Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      payload2Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      payload3Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      payload4Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      payload5Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      payload6Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
      
      payload7Name: {    
        required: 'Payload[0] Name value is required.',    
        minlength: 'Payload[0] Name must be at least three characters.',    
        maxlength: 'Payload[0] Name cannot exceed 50 characters.'       
      },
    };    
    this.genericValidator = new GenericValidator(this.validationMessages);    
  }

  ngOnInit(): void {

    if(this.userId == null)
    {
      this.userId = this.getLoggedInAccountID();
    }

    this.tranMode = "new";    
    this.userSettingsItemForm = this._fb.group({    
      pidHexValue: ['', [Validators.required,    
        Validators.minLength(2),    
        Validators.maxLength(2)    
      ]],  
      pidName: ['', [Validators.required,    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload0Name: ['', 
      [    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]],   
      payload1Name: ['', 
      [    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload2Name: ['', 
      [    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload3Name: ['', 
      [   
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload4Name: ['', 
      [    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload5Name: ['', 
      [  
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload6Name: ['', 
      [    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]], 
      payload7Name: ['', 
      [    
        Validators.minLength(3),    
        Validators.maxLength(50)    
      ]]
    });  

    if(this._router.url.toString() == "/settings/add")
    {
      this.pageTitle = "Create New";

      let _id = new Date().getTime().toString();

      const USER_SETTINGS_ITEM: UserSettingsItem = { id: _id, 
                                                     userID: this.userId, 
                                                     pidHexValue: "", 
                                                     pidName: "", 
                                                     payload0Name: "",
                                                     payload1Name: "",
                                                     payload2Name: "",
                                                     payload3Name: "",
                                                     payload4Name: "",
                                                     payload5Name: "",
                                                     payload6Name: "",
                                                     payload7Name: "",
                                                    };
      this.displayUserSettingsItem(USER_SETTINGS_ITEM);
    }
    else
    {
      this.pageTitle = "Edit";

      this.sub = this._route.paramMap.subscribe(
        params => {
          this.settingsId = params.get('id');        
          this.getUserSettingsItem(this.settingsId, this.userId);
        });
    }
  }  

  ngOnDestroy(): void {    
    if(this.sub != undefined)
      {
        this.sub.unsubscribe();  
      }         
  } 

  getUserSettingsItem(_id: string, _userID: string): void {    
    this._settingsDataService.getSingleSettingsItem(_id, _userID)    
      .subscribe(
        (userSettingsItem: UserSettingsItem) => this.displayUserSettingsItem(userSettingsItem),    
        (error: any) => this.errorMessage = <any>error    
      );    
  }
  
  displayUserSettingsItem(userSettingsItem: UserSettingsItem): void {    
    if (this.userSettingsItemForm) {    
      this.userSettingsItemForm.reset();    
    }    

    this.userSettingsItem = userSettingsItem;

    this.userSettingsItemForm.patchValue({    
      pidHexValue: this.userSettingsItem.pidHexValue, 
      pidName: this.userSettingsItem.pidName, 
      payload0Name: this.userSettingsItem.payload0Name,
      payload1Name: this.userSettingsItem.payload1Name,
      payload2Name: this.userSettingsItem.payload2Name,
      payload3Name: this.userSettingsItem.payload3Name,
      payload4Name: this.userSettingsItem.payload4Name,
      payload5Name: this.userSettingsItem.payload5Name,
      payload6Name: this.userSettingsItem.payload6Name,
      payload7Name: this.userSettingsItem.payload7Name
    });        
  } 

  saveUserSettingsItem(): void
  {
    if(this.userSettingsItemForm.valid)
    {
      if(this.userSettingsItemForm.dirty)
      {
        const userSettingToSave = { ...this.userSettingsItem, ...this.userSettingsItemForm.value };  

        this._settingsDataService.upsertSettingsItem(userSettingToSave)
        .subscribe(
          () => this.onSaveComplete(),
          (error: any) => this.errorMessage = <any>error
        );
      }
      else
      {
        this.onSaveComplete();
      }
    }
    else
    {
      this.errorMessage = 'Please correct the validation errors.';
    }
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
    this.userSettingsItemForm.reset();    
    this._router.navigate(['/settings']);    
  }  

  getLoggedInAccountID()
  {
    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);

    return accInfo.localAccountId;
  }
}
