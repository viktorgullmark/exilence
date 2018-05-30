import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
