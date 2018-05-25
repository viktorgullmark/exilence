import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { PartyComponent } from './party.component';
import { PlayerListModule } from './player-list/player-list.module';

@NgModule({
  imports: [
    SharedModule,
    PlayerListModule
  ],
  declarations: [PartyComponent]
})
export class PartyModule { }
