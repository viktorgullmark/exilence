import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { InspectPlayersComponent } from './inspect-players.component';
import { PlayerListModule } from './../components/player-list/player-list.module';
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
  declarations: [InspectPlayersComponent],
  providers: [LogMonitorService]
})
export class InspectPlayersModule { }
