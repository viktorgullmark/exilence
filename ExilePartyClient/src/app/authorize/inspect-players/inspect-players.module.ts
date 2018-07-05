import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

import { SharedModule } from '../../shared/shared.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';
import { PlayerListModule } from './../components/player-list/player-list.module';
import { InspectPlayersComponent } from './inspect-players.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    PlayerListModule,
    CharProfileModule
  ],
  declarations: [InspectPlayersComponent],
  providers: []
})
export class InspectPlayersModule { }
