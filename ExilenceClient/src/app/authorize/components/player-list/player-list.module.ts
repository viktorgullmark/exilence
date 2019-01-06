import { NgModule } from '@angular/core';
import { ContextMenuModule } from 'ngx-contextmenu';

import { SharedModule } from '../../../shared/shared.module';
import { PlayerBadgeModule } from './player-badge/player-badge.module';
import { PlayerListComponent } from './player-list.component';

@NgModule({
  imports: [
    SharedModule,
    PlayerBadgeModule,
    ContextMenuModule
  ],
  declarations: [PlayerListComponent],
  exports: [PlayerListComponent]
})
export class PlayerListModule { }
