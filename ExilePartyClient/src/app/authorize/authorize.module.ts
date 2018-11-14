import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';

import { AnalyticsService } from '../shared/providers/analytics.service';
import { IncomeService } from '../shared/providers/income.service';
import { KeybindService } from '../shared/providers/keybind.service';
import { LogMonitorService } from '../shared/providers/log-monitor.service';
import { MapService } from '../shared/providers/map.service';
import { PartyService } from '../shared/providers/party.service';
import { SharedModule } from '../shared/shared.module';
import { AuthorizeComponent } from './authorize.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { InspectPlayersModule } from './inspect-players/inspect-players.module';
import { PartyModule } from './party/party.module';
import { SettingsModule } from './settings/settings.module';
import { LadderService } from '../shared/providers/ladder.service';
import { MessageValueService } from '../shared/providers/message-value.service';
import { StashService } from '../shared/providers/stash.service';
import { FaqModule } from './faq/faq.module';

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
    FaqModule
  ],
  declarations: [AuthorizeComponent],
  providers: [
    KeybindService,
    MessageValueService,
    LogMonitorService,
    PartyService,
    IncomeService,
    MapService,
    AnalyticsService,
    LadderService,
    StashService
  ]
})
export class AuthorizeModule { }
