import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { DevicesComponent } from './modules/devices/devices.component';
import { SettingsComponent } from './modules/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [MsalGuard]},
  { path: 'devices', component: DevicesComponent, canActivate: [MsalGuard]},
  { path: 'settings', component: SettingsComponent, canActivate: [MsalGuard]},
  { path: '**', component: DashboardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
