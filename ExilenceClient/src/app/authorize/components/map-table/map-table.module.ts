import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MapTableComponent } from './map-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule, MatSortModule, MatPaginatorModule, MatIconModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { GainTooltipComponent } from './gain-tooltip/gain-tooltip.component';
import { GainTooltipContentComponent } from './gain-tooltip/gain-tooltip-content/gain-tooltip-content.component';
import { NetworthTableModule } from '../networth-table/networth-table.module';

@NgModule({
  imports: [
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatPaginatorModule,
    NetworthTableModule
  ],
  declarations: [MapTableComponent, GainTooltipComponent, GainTooltipContentComponent],
  exports: [MapTableComponent, GainTooltipComponent, GainTooltipContentComponent],
  providers: [DatePipe]
})
export class MapTableModule { }
