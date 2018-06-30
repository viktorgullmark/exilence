import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworthTableComponent } from './networth-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort'

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [NetworthTableComponent],
  exports: [NetworthTableComponent]
})
export class NetworthTableModule { }
