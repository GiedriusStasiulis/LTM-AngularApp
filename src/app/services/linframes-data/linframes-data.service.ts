import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { LinFrame } from 'src/app/models/linFrame';
import * as JSLZString from 'lz-string';

@Injectable({
  providedIn: 'root'
})
export class LinframesDataService implements OnDestroy {

  linFramesList: LinFrame[] = [];
  linFramesListFiltered: LinFrame[] = [];
  linFramesListObservable$ = new BehaviorSubject<LinFrame[]>([]);
  linFramesListObserver$ = new BehaviorSubject<LinFrame[]>([]);

  private readonly azureUrl: string = "http://localhost:7071/api/";

  private readonly _destroyed$ = new Subject<void>();

  constructor(private _httpClient: HttpClient) {
    
    /*this.linFramesListObservable$
    .pipe(
        takeUntil(this._destroyed$)
      )
      .subscribe(frames => {
        this.linFramesListObserver$.next(frames);
      });*/

    //this.loadFramesFromSessionStorage();
   }  

  pushFramesToObservable(_linFrames: LinFrame[])
  {
    const NEW_FRAMES = this.linFramesListObservable$.value.concat(_linFrames);
    this.linFramesListObservable$.next(NEW_FRAMES);
  }

  /*getAllFramesForSession(_sessionID: string): Observable<LinFrame[]>
  {
    if(this.linFramesList$.getValue().length ==0)
    {
      let requestUrl: string = `${this.azureUrl}GetLinFramesForSession/${_sessionID}`;
      return this._httpClient.get<LinFrame[]>(requestUrl)
      .pipe(
        tap((response: LinFrame[]) => {
          this.linFramesList$.next(response)
        }),
        catchError(this.handleError)
      );  
    }

    return this.linFramesList$.asObservable();
  }*/

  filterFrames(filterText : string)
  {
    /*console.log("Filter text: " + filterText)

    this.linFramesListObservable$
    .pipe(
        takeUntil(this._destroyed$)
      )
      .subscribe(frames => {
        
        this.linFramesListFiltered = frames.filter(item =>
          Object.keys(item).some(
            k =>
              item[k] != null &&
              item[k]
                .toString()
                .toLowerCase()
                .includes(filterText.toLowerCase())
          )
        );
      });

      console.log("Matches found: " + this.linFramesListFiltered.length);

      this.linFramesListObservable$.next(this.linFramesListFiltered);*/
  }

  clearFrames()
  {
    this.linFramesList = [];
    this.linFramesListObservable$.next(this.linFramesList);
    sessionStorage.setItem("LinFramesSessionStorage","");
  }

  loadFramesFromSessionStorage()
  {
    var itemsCompressed = sessionStorage.getItem("LinFramesSessionStorage");

    if(itemsCompressed != null && itemsCompressed.length > 0)
    {
      var itemsDecompressed = JSLZString.decompress(itemsCompressed);
      const frames: LinFrame[] = JSON.parse(itemsDecompressed);
  
      if(frames.length > 0)
      {
        console.log("Frame lenght from session storage: " + frames.length)
        this.linFramesListObservable$.next(frames);
      } 
    }
  }

  saveFramesToSessionStorage()
  {
     console.log("Saving!"); 
     sessionStorage.setItem("LinFramesSessionStorage", "");

    this.linFramesListObservable$.subscribe(frames => {
      console.log("Frames count: " + frames.length); 

      var itemsCompressed = JSLZString.compress(JSON.stringify(frames));
      sessionStorage.setItem("LinFramesSessionStorage", itemsCompressed);
      this.checkSessionStorageSize();
    })
  }

  checkSessionStorageSize()
  {
    var limit = 1024 * 1024 * 5; //5 Mb
    var remSpace = limit - unescape(encodeURIComponent(JSON.stringify(sessionStorage))).length;

    console.log("SessionStorage limit: " + limit);
    console.log("Remaining sessionStorage space: " + remSpace);
  }

  ngOnDestroy(): void {



    this._destroyed$.next(null);
    this._destroyed$.complete();
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
