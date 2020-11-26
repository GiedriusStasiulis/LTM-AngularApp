import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { SidebarModule } from './modules/sidebar/sidebar.module';
import { ToggleSidebarModule } from './modules/toggle-sidebar/toggle-sidebar.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HeaderModule } from './modules/header/header.module';

import {
  MsalModule,
  MsalInterceptor,
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
      navigateToLoginRequestUrl: false,
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
      "profile",
      "api://5d98c088-fcf6-46b5-b2d8-d912c8126c0d/.default"
    ],
    unprotectedResources: ["https://www.microsoft.com/en-us/"],
    protectedResourceMap: [
      ['https://graph.microsoft.com/v2.0/me', ['User.Read']]
    ],
    extraQueryParameters: {}
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    DashboardModule,
    SidebarModule,
    HeaderModule,
    DevicesModule,
    ToggleSidebarModule,
    MatTabsModule,
    SettingsModule,
    MatTableModule,
    MatSortModule,
    MsalModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
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
    
  ],
  exports: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
