import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule, MatPaginatorModule, MatSortModule, MatTooltipModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';

import { SharedModule } from '../../../shared/shared.module';
import { NetworthTableModule } from '../networth-table/networth-table.module';
import { GainTooltipContentComponent } from './gain-tooltip/gain-tooltip-content/gain-tooltip-content.component';
import { GainTooltipComponent } from './gain-tooltip/gain-tooltip.component';
import { MapTableComponent } from './map-table.component';

@NgModule({
  imports: [
    SharedModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatPaginatorModule,
    NetworthTableModule,
  ],
  declarations: [MapTableComponent, GainTooltipComponent, GainTooltipContentComponent],
  exports: [MapTableComponent, GainTooltipComponent, GainTooltipContentComponent],
  providers: [DatePipe]
})
export class MapTableModule { }
