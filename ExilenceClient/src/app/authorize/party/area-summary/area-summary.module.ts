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
import { AreaSummaryComponent } from './area-summary.component';
import { MapTableModule } from '../../components/map-table/map-table.module';

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
    MapTableModule
  ],
  declarations: [AreaSummaryComponent],
  exports: [AreaSummaryComponent]
})
export class AreaSummaryModule { }
