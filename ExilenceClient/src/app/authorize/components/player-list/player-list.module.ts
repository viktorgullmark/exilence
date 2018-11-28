import { NgModule } from '@angular/core';
import { PlayerListComponent } from './player-list.component';
import { PlayerBadgeModule } from './player-badge/player-badge.module';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    PlayerBadgeModule
  ],
  declarations: [PlayerListComponent],
  exports: [PlayerListComponent]
})
export class PlayerListModule { }
