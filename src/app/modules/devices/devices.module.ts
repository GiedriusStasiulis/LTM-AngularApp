import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesComponent } from './devices.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MsalTokenService } from 'src/app/services/msal-token-service/msal-token.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';

@NgModule({
  declarations: [DevicesComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule
  ],
  exports: [],
  providers: [
    MsalTokenService,
    SignalRService
  ]
})
export class DevicesModule { }
