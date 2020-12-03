import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    MatTableModule
  ]
})
export class SettingsModule { }
