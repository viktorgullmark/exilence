import { NgModule } from '@angular/core';
import { MatCardModule, MatDividerModule, MatIconModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
