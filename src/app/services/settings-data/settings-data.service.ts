import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'; 
import { UserSettingsItem } from 'src/app/models/userSettingsItem';

@Injectable({
  providedIn: 'root'
})
export class SettingsDataService {

  userSettingsList: UserSettingsItem[] = [];
  userSettingsList$ = new BehaviorSubject<UserSettingsItem[]>([]);
  userSettingItem$: BehaviorSubject<UserSettingsItem | undefined>;

  //private readonly azureUrl: string = "http://localhost:7071/api/";
  private readonly azureUrl: string = "https://ltmfunctionsappv2.azurewebsites.net/api/"; 

  constructor(private _httpClient: HttpClient) { 
    this.userSettingItem$ = new BehaviorSubject<UserSettingsItem | undefined>(undefined);
  }

  getAllUserSettings(_userID : string): Observable<UserSettingsItem[]>
  {
    // only if length of array is 0, load from db
    if(this.userSettingsList$.getValue().length == 0)
    {
      let requestUrl: string = `${this.azureUrl}GetAllUserSettings/${_userID}`;
      return this._httpClient.get<UserSettingsItem[]>(requestUrl)
      .pipe(
        tap((response: UserSettingsItem[]) => {
          this.userSettingsList$.next(response)
        }),
        catchError(this.handleError)
      );  
    }

    return this.userSettingsList$.asObservable();
  }

  getSingleSettingsItem(_settingsItemID: string, _userID: string): Observable<UserSettingsItem>
  {
    if(this.userSettingsList$.getValue().length == 0)
    {
      let requestUrl: string = `${this.azureUrl}GetSingleUserSettingsItem?id=${_settingsItemID}&UserID=${_userID}`;
      return this._httpClient.get<UserSettingsItem>(requestUrl)
      .pipe(
        tap((response: UserSettingsItem) => {
          this.userSettingItem$.next(response)
        }),
        catchError(this.handleError)
      );  
    }
    else
    {
      let item = this.userSettingsList$.getValue().find(i => i.id === _settingsItemID);
      this.userSettingItem$.next(item);

      return this.userSettingItem$.asObservable();
    }
  }

  upsertSettingsItem(_userSettingsItem: UserSettingsItem) : Observable<object>
  {
    let requestUrl: string = `${this.azureUrl}UpsertUserSettingsItem`;
    return this._httpClient.post(requestUrl,_userSettingsItem)
    .pipe(  
      map(() => {
        this.userSettingsList = this.userSettingsList$.getValue();

        let itemIndex = this.userSettingsList.findIndex(r => r.id === _userSettingsItem.id);

        if(itemIndex == -1)
        {
          //Push to array
          this.userSettingsList.push(_userSettingsItem);
          this.userSettingsList$.next(this.userSettingsList);
        }
        else
        {
          //Update
          this.userSettingsList[itemIndex] = _userSettingsItem;
          this.userSettingsList$.next(this.userSettingsList);
        }
      }),
      map(() => _userSettingsItem),  
      catchError(this.handleError)
    ); 
  }

  deleteSettingsItem(_settingsItemID: string, _userID: string): Observable<object>
  {
    let requestUrl: string = `${this.azureUrl}DeleteUserSettingsItem?id=${_settingsItemID}&UserID=${_userID}`;
    return this._httpClient.delete(requestUrl)
    .pipe(    
      tap(() => {
        this.userSettingsList = this.userSettingsList$.getValue();
        this.userSettingsList.splice(this.userSettingsList.findIndex(item => item.id === _settingsItemID),1);
        this.userSettingsList$.next(this.userSettingsList);
      }),   
      catchError(this.handleError)
    );
  }

  private handleError(err) {  
    let errorMessage: string;  
    if (err.error instanceof ErrorEvent) {  
      errorMessage = `An error occurred: ${err.error.message}`;  
    } else {  
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;  
    }  
    console.log("Error: " + errorMessage)
    console.error(err);  
    return throwError(errorMessage);  
  }  
}
