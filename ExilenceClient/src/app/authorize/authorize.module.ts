import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
} from '@angular/material';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';

import { IncomeService } from '../shared/providers/income.service';
import { MessageValueService } from '../shared/providers/message-value.service';
import { PricingService } from '../shared/providers/pricing.service';
import { SharedModule } from '../shared/shared.module';
import { AuthorizeComponent } from './authorize.component';
import { ServerMessageDialogComponent } from './components/server-message-dialog/server-message-dialog.component';
import { ServerMessageDialogModule } from './components/server-message-dialog/server-message-dialog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InspectPlayersModule } from './inspect-players/inspect-players.module';
import { PartyModule } from './party/party.module';
import { SettingsModule } from './settings/settings.module';

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
    MatCheckboxModule,
    MatGridListModule,
    ServerMessageDialogModule
  ],
  declarations: [AuthorizeComponent],
  providers: [
    MessageValueService,
    PricingService,
    IncomeService,
  ],
  entryComponents: [ServerMessageDialogComponent]
})
export class AuthorizeModule { }
