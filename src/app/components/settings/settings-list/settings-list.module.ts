import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsListComponent } from './settings-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [SettingsListComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
  ]
})
export class SettingsListModule { }