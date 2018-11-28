import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartySummaryComponent } from './party-summary.component';
import { MatButtonModule, MatInputModule, MatMenuModule, MatIconModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NetworthTableModule } from '../../components/networth-table/networth-table.module';
import { IncomeModule } from '../../components/income/income.module';
import { SharedModule } from '../../../shared/shared.module';
import { InfoDialogModule } from '../../components/info-dialog/info-dialog.module';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    IncomeModule,
    NetworthTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    InfoDialogModule
  ],
  declarations: [PartySummaryComponent],
  exports: [PartySummaryComponent],
  entryComponents: [InfoDialogComponent]
})
export class PartySummaryModule { }
