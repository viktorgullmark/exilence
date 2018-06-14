import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentPlayersComponent } from './recent-players.component';
import { MatDividerModule, MatCardModule, MatButtonModule } from '@angular/material';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule
  ],
  declarations: [RecentPlayersComponent],
  exports: [RecentPlayersComponent]
})
export class RecentPlayersModule { }
