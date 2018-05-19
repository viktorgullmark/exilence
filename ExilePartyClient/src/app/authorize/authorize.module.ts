import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { AuthorizeComponent } from './authorize.component';
import { PartyModule } from './party/party.module';
import { ProfileModule } from './profile/profile.module';
import { PartyService } from '../shared/providers/party.service';

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
    ProfileModule,
    RouterModule,
    PartyModule,
    MatSidenavModule
  ],
  declarations: [AuthorizeComponent],
  providers: [PartyService]
})
export class AuthorizeModule { }
