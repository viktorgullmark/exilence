import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { PlayerBadgeModule } from './player-badge/player-badge.module';
import { PlayerListComponent } from './player-list.component';

@NgModule({
  imports: [
    SharedModule,
    PlayerBadgeModule,
  ],
  declarations: [PlayerListComponent],
  exports: [PlayerListComponent]
})
export class PlayerListModule { }
