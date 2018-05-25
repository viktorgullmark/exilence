import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerListComponent } from './player-list.component';
import { PlayerBadgeModule } from './player-badge/player-badge.module';

@NgModule({
  imports: [
    CommonModule,
    PlayerBadgeModule
  ],
  declarations: [PlayerListComponent],
  exports: [PlayerListComponent]
})
export class PlayerListModule { }
