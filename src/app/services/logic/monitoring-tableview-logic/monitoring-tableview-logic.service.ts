import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { LinFrame } from 'src/app/models/data/linFrame';
import { UserSettingsItem } from 'src/app/models/data/userSettingsItem';
import { LinframesDataService } from '../../data/linframes-data/linframes-data.service';
import { SettingsDataService } from '../../data/settings-data/settings-data.service';

@Injectable({
  providedIn: 'root'
})
export class MonitoringTableviewLogicService implements OnDestroy{

  private readonly _destroyed$ = new Subject<void>();

  public filterText$ = new BehaviorSubject<string>("");
  private filterText: string = "";
  public frameDatalist$ = new BehaviorSubject<LinFrame[]>([]);
  public filteredFrameDatalist$ = new BehaviorSubject<LinFrame[]>([]);
  private filteredFrameDatalist: LinFrame[] = [];

  public userSettingsItems$ = new BehaviorSubject<UserSettingsItem[]>([]);

  public showDecimalValues$ = new BehaviorSubject<boolean>(false);

  constructor(private _linframesDataService: LinframesDataService,
              private _settingsDataService: SettingsDataService) 
  { 
    //Signal names data sub
    this._settingsDataService.getAllUserSettings(this.getCurrentAccountId()).pipe(
      takeUntil(this._destroyed$)
    )
    .subscribe(    
      userSettingsItems => {    
        this.userSettingsItems$.next(userSettingsItems);
      },    
      error => console.log(error)   
    );

    //Lin frames data sub
    this._linframesDataService.linFramesListObservable$.pipe(
      takeUntil(this._destroyed$),
      withLatestFrom(this.userSettingsItems$),
    )
    .subscribe(([items, settings]) => {

      settings.forEach(element => {
        let itemIndex = items.findIndex(r => r.PID === element.pidHexValue);
  
          //Signal PID Hex value exists in user settings
          if(itemIndex != -1)
          {
            items[itemIndex].PIDName = element.pidName.length > 0 ? ` [${element.pidName}]` : "";
            items[itemIndex].FDATA0Name = element.payload0Name.length > 0 ? ` [${element.payload0Name}]` : "";
            items[itemIndex].FDATA1Name = element.payload1Name.length > 0 ? ` [${element.payload1Name}]` : "";
            items[itemIndex].FDATA2Name = element.payload2Name.length > 0 ? ` [${element.payload2Name}]` : "";
            items[itemIndex].FDATA3Name = element.payload3Name.length > 0 ? ` [${element.payload3Name}]` : "";
            items[itemIndex].FDATA4Name = element.payload4Name.length > 0 ? ` [${element.payload4Name}]` : "";
            items[itemIndex].FDATA5Name = element.payload5Name.length > 0 ? ` [${element.payload5Name}]` : "";
            items[itemIndex].FDATA6Name = element.payload6Name.length > 0 ? ` [${element.payload6Name}]` : "";
            items[itemIndex].FDATA7Name = element.payload7Name.length > 0 ? ` [${element.payload7Name}]` : "";
            
            items[itemIndex] = items[itemIndex];
          }
        });

        this.filteredFrameDatalist = items;
        this.frameDatalist$.next(this.filteredFrameDatalist);

        if(this.filterText.length > 0)
        {
          this.filteredFrameDatalist = items.filter(item =>
            Object.keys(item).some(
              k =>
                item[k] != null &&
                item[k]
                  .toString()
                  .toLowerCase()
                  .includes(this.filterText.toLowerCase())
            )
          );
        }

        this.frameDatalist$.next(this.filteredFrameDatalist);
    });

    //Filter text sub
    this.filterText$.pipe(
      takeUntil(this._destroyed$)
      )
      .subscribe(value => {

        this.filterText = value;

        this._linframesDataService.linFramesListObservable$.subscribe(items => {

          this.filteredFrameDatalist = items.filter(item =>
            Object.keys(item).some(
              k =>
                item[k] != null &&
                item[k]
                  .toString()
                  .toLowerCase()
                  .includes(this.filterText.toLowerCase())
            )
          );
        });

        this.frameDatalist$.next(this.filteredFrameDatalist);
      });
  }

  connectToSignalRGroup(deviceId: string)
  {

  }

  disconnectFromSignalRGroup()
  {

  }

  getCurrentAccountId()
  {
    const localAccount = sessionStorage.getItem("signedInAccount");
    var accInfo = JSON.parse(localAccount);

    return accInfo.localAccountId;
  }

  ngOnDestroy(): void {

    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}
