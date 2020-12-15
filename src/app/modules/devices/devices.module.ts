import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesComponent } from './devices.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ComponentStateService } from '../../services/component-state-service/component-state.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableviewLogicService } from 'src/app/services/logic/tableview-logic/tableview-logic.service';

@NgModule({
  declarations: [DevicesComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    NgSelectModule,
    FormsModule,
    ScrollingModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  exports: [],
  providers: [
    SignalRService,
    ComponentStateService,
    TableviewLogicService
  ]
})
export class DevicesModule { }
