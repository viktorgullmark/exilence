import { NgModule } from '@angular/core';
import { MatDividerModule, MatCardModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { RecentPlayersModule } from '../components/recent-players/recent-players.module';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule,
    RecentPlayersModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
