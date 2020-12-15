import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { LinFrame } from 'src/app/models/linFrame';
import { LinframesDataService } from 'src/app/services/linframes-data/linframes-data.service';
import { SettingsDataService } from '../../settings-data/settings-data.service';

@Injectable({
  providedIn: 'root'
})
export class TableviewLogicService implements OnDestroy{

  private readonly _destroyed$ = new Subject<void>();

  public filterEnabled$ = new BehaviorSubject<boolean>(false);
  private filterEnabled: boolean = false;
  public filterText$ = new BehaviorSubject<string>("");
  private filterText: string = "";
  public frameDatalist$ = new BehaviorSubject<LinFrame[]>([]);
  private frameDatalist: LinFrame[] = [];
  public filteredFrameDatalist$ = new BehaviorSubject<LinFrame[]>([]);
  private filteredFrameDatalist: LinFrame[] = [];

  constructor(private _linframesDataService: LinframesDataService,
              private _settingsDataService: SettingsDataService) 
  { 
    console.log("TableViewLogic service constructor!")    

    this._linframesDataService.linFramesListObservable$
      .subscribe(items => {

        this.filteredFrameDatalist = items;

        console.log("Filter text: " + this.filterText);

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

    /*this._linframesDataService.linFramesListObservable$.pipe(
      takeUntil(this._destroyed$),
      withLatestFrom(this.filterText$)
      )
      .subscribe(([frames, filterText]) => {

        console.log(frames.length);

        if(filterText.length > 0)
        {
          frames = frames.filter(item =>
            Object.keys(item).some(
              k =>
                item[k] != null &&
                item[k]
                  .toString()
                  .toLowerCase()
                  .includes(filterText.toLowerCase())
            )
          );
        }

        
        this.frameDatalist$.next(frames);
    });*/

      /*this.filterText$.pipe(
        takeUntil(this._destroyed$),
        withLatestFrom(this._linframesDataService.linFramesListObservable$)
        )
        .subscribe(([filterText, frames ]) => {
            console.log(`Combined values are: ${filterText.length} & ${frames.length}`)
        });*/

    /*this.filterText$.pipe(
      takeUntil(this._destroyed$),
      withLatestFrom(this.frameDatalist$)
      )
      .subscribe(([filterText, frames]) =>{

          console.log("Filter text: " + filterText)

          if(filterText.length > 0)
          {
            this.filteredFrameDatalist = frames.filter(item =>
              Object.keys(item).some(
                k =>
                  item[k] != null &&
                  item[k]
                    .toString()
                    .toLowerCase()
                    .includes(filterText.toLowerCase())
              )
            );
  
            console.log("Matches found: " + this.filteredFrameDatalist.length)
  
            this.frameDatalist$.next(this.filteredFrameDatalist);
          }
          else
          {
            this.frameDatalist$.next(this.frameDatalist);
          }                    
      });  */
  }

  connectToSignalRGroup(deviceId: string)
  {

  }

  disconnectFromSignalRGroup()
  {

  }

  filterFramesData()
  {

  }

  toggleHexDecValues()
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
