import '../polyfills';
import 'reflect-metadata';
import 'zone.js/dist/zone-mix';

import { DatePipe, UpperCasePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizeModule } from './authorize/authorize.module';
import { NotficationBarModule } from './authorize/components/notfication-bar/notfication-bar.module';
import { LoginModule } from './login/login.module';
import { NotFoundModule } from './not-found/not-found.module';
import { WebviewDirective } from './shared/directives/webview.directive';
import { CanActivateAuthorized } from './shared/guards/authorized.guard';
import { AccountService } from './shared/providers/account.service';
import { ElectronService } from './shared/providers/electron.service';
import { ExternalService } from './shared/providers/external.service';
import { IncomeService } from './shared/providers/income.service';
import { NinjaService } from './shared/providers/ninja.service';
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
    NotficationBarModule,
    MatToolbarModule,
    MatIconModule,
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
  providers: [
    ExternalService,
    ElectronService,
    CanActivateAuthorized,
    AccountService,
    SessionService,
    SettingsService,
    UpperCasePipe,
    DatePipe,
    NinjaService,
    IncomeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
