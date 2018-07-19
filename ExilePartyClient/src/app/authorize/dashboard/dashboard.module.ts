import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatDividerModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
