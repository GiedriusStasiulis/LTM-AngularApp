import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { DevicesComponent } from './modules/devices/devices.component';
import { SettingsEditComponent } from './modules/settings/settings-edit/settings-edit.component';
import { SettingsListComponent } from './modules/settings/settings-list/settings-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard]},
  { path: 'devices', component: DevicesComponent, canActivate: [MsalGuard]},
  { path: 'settings', component: SettingsListComponent, canActivate: [MsalGuard]},
  { path: 'settings/:id/edit', component: SettingsEditComponent, pathMatch: 'full', canActivate: [MsalGuard]},
  { path: 'settings/add', component: SettingsEditComponent, pathMatch: 'full', canActivate: [MsalGuard]},
  { path: '**', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
