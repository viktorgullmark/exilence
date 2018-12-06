import { NgModule } from '@angular/core';
import { MatCardModule, MatDividerModule, MatIconModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { InfoDialogModule } from '../components/info-dialog/info-dialog.module';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule,
    InfoDialogModule
  ],
  declarations: [DashboardComponent],
  entryComponents: [InfoDialogComponent]
})
export class DashboardModule { }
