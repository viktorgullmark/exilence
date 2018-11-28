import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerBadgeComponent } from './player-badge.component';
import { MatCardModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule
  ],
  declarations: [PlayerBadgeComponent],
  exports: [PlayerBadgeComponent]
})
export class PlayerBadgeModule { }
