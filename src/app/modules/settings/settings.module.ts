import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { MatTableModule } from '@angular/material/table';
import { SettingsDataService } from '../../services/settings-data/settings-data.service';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    MatTableModule
  ],
  providers: [
    SettingsDataService
  ]
})
export class SettingsModule { }
