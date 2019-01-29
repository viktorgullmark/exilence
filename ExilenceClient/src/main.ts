import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';
import 'hammerjs';
import * as Sentry from '@sentry/browser';



if (AppConfig.production) {
  enableProdMode();
}

Sentry.init({
  dsn: AppConfig.sentryDsn,
  sampleRate: 0.1
});

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .catch(err => console.error(err));
