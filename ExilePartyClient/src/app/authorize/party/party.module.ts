import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

import { LogMonitorService } from '../../shared/providers/log-monitor.service';
import { SharedModule } from '../../shared/shared.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';
import { PlayerListModule } from './../components/player-list/player-list.module';
import { PartyComponent } from './party.component';
import { MatTabsModule, MatIconModule } from '@angular/material';


@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    PlayerListModule,
    CharProfileModule,
    MatTabsModule,
    MatIconModule
  ],
  declarations: [PartyComponent],
  providers: [
    LogMonitorService
  ]
})
export class PartyModule { }
