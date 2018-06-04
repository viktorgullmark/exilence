import { NgModule } from '@angular/core';
import { PlayerListComponent } from './player-list.component';
import { PlayerBadgeModule } from './player-badge/player-badge.module';
import { SharedModule } from '../../../shared/shared.module';
import { GroupByLeaguePipeModule } from '../../../shared/pipes/group-by-league.pipe';

@NgModule({
  imports: [
    SharedModule,
    PlayerBadgeModule,
    GroupByLeaguePipeModule
  ],
  declarations: [PlayerListComponent],
  exports: [PlayerListComponent]
})
export class PlayerListModule { }
