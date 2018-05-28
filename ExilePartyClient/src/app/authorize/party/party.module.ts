import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { PartyComponent } from './party.component';
import { PlayerListModule } from './player-list/player-list.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';
import {MatDividerModule} from '@angular/material/divider';
import { LogMonitorService } from '../../shared/providers/log-monitor.service';
@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    PlayerListModule,
    CharProfileModule
  ],
  declarations: [PartyComponent],
  providers: [LogMonitorService]
})
export class PartyModule { }
