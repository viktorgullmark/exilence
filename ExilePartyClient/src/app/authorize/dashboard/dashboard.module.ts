import { NgModule } from '@angular/core';
import { MatCardModule, MatDividerModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
