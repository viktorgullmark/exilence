import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatTabsModule,
} from '@angular/material';

import { SharedModule } from '../../../shared/shared.module';
import { LadderSummaryComponent } from './ladder-summary.component';
import { LadderTableModule } from '../../components/ladder-table/ladder-table.module';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    LadderTableModule
  ],
  declarations: [LadderSummaryComponent],
  exports: [LadderSummaryComponent]
})
export class LadderSummaryModule { }
