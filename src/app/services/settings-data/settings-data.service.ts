import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomByteNamingItem } from 'src/app/models/customByteNamingItem';

@Injectable({
  providedIn: 'root'
})
export class SettingsDataService {

  private readonly azureUrl: string = "http://localhost:7071/api/";

  constructor(private _httpClient: HttpClient) { }

  saveCustomByteNames(_customByteNamingItem: CustomByteNamingItem): Observable<object>
  {
    let requestUrl: string = `${this.azureUrl}SaveCustomByteNames`;
    return this._httpClient.post(requestUrl,_customByteNamingItem);
  }
}
