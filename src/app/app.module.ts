import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SidebarModule } from './modules/sidebar/sidebar.module';
import { ToggleSidebarModule } from './modules/toggle-sidebar/toggle-sidebar.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DevicesModule } from './modules/devices/devices.module';
import { HeaderModule } from './modules/header/header.module';
import { SettingsListModule } from './modules/settings/settings-list/settings-list.module';
import { SettingsEditModule } from './modules/settings/settings-edit/settings-edit.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';  
import { RouterModule, Routes } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';

import {
  MsalModule,
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
  MsalService,
  MsalAngularConfiguration
} from '@azure/msal-angular';
import { Configuration } from 'msal';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MsalTokenService } from './services/msal-token-service/msal-token.service';
import { SignalRService } from './services/signalR/signal-r.service';
import { ComponentStateService } from './services/component-state-service/component-state.service';
import { SettingsDataService } from '../app/services/settings-data/settings-data.service';
import { MsalTokenInterceptorService } from './services/msal-token-interceptor/msal-token-interceptor.service';
import { LinframesDataService } from './services/linframes-data/linframes-data.service';

export const protectedResourceMap: [string, string[]][] = [
  ['https://graph.microsoft.com/v2.0/me', ['user.read']]
];

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

function MSALConfigFactory(): Configuration {
  return {
    auth: {
      clientId: '5d98c088-fcf6-46b5-b2d8-d912c8126c0d',
      authority: "https://login.microsoftonline.com/7d980800-3399-486f-9751-570df69d59b0",
      validateAuthority: true,
      redirectUri: "http://localhost:4200/",
      postLogoutRedirectUri: "http://localhost:4200/",
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
  };
}

function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: !isIE,
    consentScopes: [
      "User.Read",
      "openid",
      "profile"
    ],
    unprotectedResources: ["https://www.microsoft.com/en-us/"],
    protectedResourceMap: protectedResourceMap,
    extraQueryParameters: {}
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    DashboardModule,
    SidebarModule,
    HeaderModule,
    SettingsListModule,
    SettingsEditModule,
    DevicesModule,
    ToggleSidebarModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MsalModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSelectModule,
    MatFormFieldModule,
    NgSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatCardModule,
    ScrollingModule,
    TableVirtualScrollModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalTokenInterceptorService,
      multi: true
    },
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory
    },
    MsalService,
    MsalTokenService,
    SignalRService,
    ComponentStateService,
    SettingsDataService,
    LinframesDataService
  ],
  exports: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
