import { NgModule } from '@angular/core';
import { MatIconModule, MatTabsModule } from '@angular/material';
import { MatDividerModule } from '@angular/material/divider';

import { SharedModule } from '../../shared/shared.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';
import { PlayerListModule } from '../components/player-list/player-list.module';
import { PartySummaryModule } from './party-summary/party-summary.module';
import { PartyComponent } from './party.component';
import { LadderSummaryModule } from './ladder-summary/ladder-summary.module';
import { AreaSummaryModule } from './area-summary/area-summary.module';


@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    PlayerListModule,
    CharProfileModule,
    MatTabsModule,
    MatIconModule,
    PartySummaryModule,
    LadderSummaryModule,
    AreaSummaryModule
  ],
  declarations: [PartyComponent],
  providers: []
})
export class PartyModule { }
