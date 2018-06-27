import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworthTableComponent } from './networth-table.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule
  ],
  declarations: [NetworthTableComponent],
  exports: [NetworthTableComponent]
})
export class NetworthTableModule { }
