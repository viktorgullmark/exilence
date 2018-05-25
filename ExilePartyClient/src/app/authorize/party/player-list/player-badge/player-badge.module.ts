import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerBadgeComponent } from './player-badge.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PlayerBadgeComponent],
  exports: [PlayerBadgeComponent]
})
export class PlayerBadgeModule { }
