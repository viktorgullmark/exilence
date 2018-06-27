import { NgModule } from '@angular/core';
import { MatCardModule, MatDividerModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { IncomeModule } from '../components/income/income.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule,
    IncomeModule,
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
