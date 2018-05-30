import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { AuthorizeComponent } from './authorize.component';
import { PartyModule } from './party/party.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PartyService } from '../shared/providers/party.service';
import { RecentPlayersModule } from './components/recent-players/recent-players.module';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    DashboardModule,
    RouterModule,
    PartyModule,
    MatSidenavModule
  ],
  declarations: [AuthorizeComponent],
  providers: [PartyService]
})
export class AuthorizeModule { }
