import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizeModule } from './authorize/authorize.module';
import { LoginModule } from './login/login.module';
import { NotFoundModule } from './not-found/not-found.module';
import { WebviewDirective } from './shared/directives/webview.directive';
import { ElectronService } from './shared/providers/electron.service';
import { PartyService } from './shared/providers/party.service';
import { RouterModule } from '@angular/router';
import { CanActivateAuthorized } from './shared/guards/authorized.guard';
import { ExternalService } from './shared/providers/external.service';
import { AccountService } from './shared/providers/account.service';
import { SessionService } from './shared/providers/session.service';
import { SettingsService } from './shared/providers/settings.service';

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
    MatToolbarModule,

    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,

    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [ExternalService, ElectronService, CanActivateAuthorized, AccountService, SessionService, SettingsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
