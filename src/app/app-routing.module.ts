import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { MonitoringTableviewComponent } from './components/monitoring-tableview/monitoring-tableview.component';
import { SettingsEditComponent } from './components/settings/settings-edit/settings-edit.component';
import { SettingsListComponent } from './components/settings/settings-list/settings-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/monitoring-tableview', pathMatch: 'full' },
  //{ path: 'monitoring-chartview', component: MonitoringChartviewComponent, canActivate: [MsalGuard]},
  { path: 'monitoring-tableview', component: MonitoringTableviewComponent, canActivate: [MsalGuard]},
  { path: 'settings', component: SettingsListComponent, canActivate: [MsalGuard]},
  { path: 'settings/:id/edit', component: SettingsEditComponent, pathMatch: 'full', canActivate: [MsalGuard]},
  { path: 'settings/add', component: SettingsEditComponent, pathMatch: 'full', canActivate: [MsalGuard]},
  { path: '**', component: MonitoringTableviewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
