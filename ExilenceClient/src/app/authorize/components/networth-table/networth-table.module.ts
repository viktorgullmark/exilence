import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { NetworthTableComponent } from './networth-table.component';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule
  ],
  declarations: [NetworthTableComponent],
  exports: [NetworthTableComponent]
})
export class NetworthTableModule { }
