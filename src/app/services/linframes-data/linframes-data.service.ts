import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LinFrame } from 'src/app/models/linFrame';

@Injectable({
  providedIn: 'root'
})
export class LinframesDataService {

  linFramesList: LinFrame[] = [];
  linFramesList$ = new BehaviorSubject<LinFrame[]>([]);

  private readonly azureUrl: string = "http://localhost:7071/api/";

  constructor(private _httpClient: HttpClient) { }

  pushFramesToObservable(_linFrames: LinFrame[])
  {
    this.linFramesList$.next(_linFrames);
  }

  getAllFramesForSession(_sessionID: string): Observable<LinFrame[]>
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
    else{
      
    }

    return this.linFramesList$.asObservable();
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
