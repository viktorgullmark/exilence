import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';

import { AnalyticsService } from '../shared/providers/analytics.service';
import { IncomeService } from '../shared/providers/income.service';
import { KeybindService } from '../shared/providers/keybind.service';
import { MessageValueService } from '../shared/providers/message-value.service';
import { PartyService } from '../shared/providers/party.service';
import { SharedModule } from '../shared/shared.module';
import { AuthorizeComponent } from './authorize.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { FaqModule } from './faq/faq.module';
import { InspectPlayersModule } from './inspect-players/inspect-players.module';
import { PartyModule } from './party/party.module';
import { SettingsModule } from './settings/settings.module';
import { PricingService } from '../shared/providers/pricing.service';
import { ServerMessageDialogComponent } from './components/server-message-dialog/server-message-dialog.component';
import { ServerMessageDialogModule } from './components/server-message-dialog/server-message-dialog.module';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    DashboardModule,
    RouterModule,
    PartyModule,
    InspectPlayersModule,
    MatSidenavModule,
    SettingsModule,
    FaqModule,
    MatCheckboxModule,
    ServerMessageDialogModule
  ],
  declarations: [AuthorizeComponent],
  providers: [
    KeybindService,
    MessageValueService,
    PartyService,
    PricingService,
    IncomeService,
    AnalyticsService
  ],
  entryComponents: [ServerMessageDialogComponent]
})
export class AuthorizeModule { }
