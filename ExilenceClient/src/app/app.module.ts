import '../polyfills';
import 'reflect-metadata';
import 'zone.js/dist/zone-mix';

import { DatePipe, UpperCasePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ContextMenuModule } from 'ngx-contextmenu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizeModule } from './authorize/authorize.module';
import { NotficationBarModule } from './authorize/components/notfication-bar/notfication-bar.module';
import { DisconnectedModule } from './disconnected/disconnected.module';
import { LoginModule } from './login/login.module';
import { NotFoundModule } from './not-found/not-found.module';
import { WebviewDirective } from './shared/directives/webview.directive';
import { CanActivateAuthorized } from './shared/guards/authorized.guard';
import { AccountService } from './shared/providers/account.service';
import { AlertService } from './shared/providers/alert.service';
import { AnalyticsService } from './shared/providers/analytics.service';
import { ElectronService } from './shared/providers/electron.service';
import { ExternalService } from './shared/providers/external.service';
import { LogMonitorService } from './shared/providers/log-monitor.service';
import { LogService } from './shared/providers/log.service';
import { MapService } from './shared/providers/map.service';
import { NinjaService } from './shared/providers/ninja.service';
import { SessionService } from './shared/providers/session.service';
import { SettingsService } from './shared/providers/settings.service';
import { PartyService } from './shared/providers/party.service';
import { StateService } from './shared/providers/state.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective
  ],
  imports: [
    NotFoundModule,
    LoginModule,
    AuthorizeModule,
    NotficationBarModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    DisconnectedModule,

    BrowserAnimationsModule,
    ContextMenuModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [,
    ExternalService,
    AnalyticsService,
    ElectronService,
    StateService,
    LogService,
    CanActivateAuthorized,
    AccountService,
    SessionService,
    SettingsService,
    UpperCasePipe,
    DatePipe,
    NinjaService,
    AlertService,
    LogMonitorService,
    MapService,
    PartyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
