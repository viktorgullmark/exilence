import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { PartyComponent } from './party.component';
import { PlayerListModule } from './player-list/player-list.module';
import { CharProfileModule } from '../components/char-profile/char-profile.module';

@NgModule({
  imports: [
    SharedModule,
    PlayerListModule,
    CharProfileModule
  ],
  declarations: [PartyComponent]
})
export class PartyModule { }
