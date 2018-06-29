import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapTableComponent } from './map-table.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule
  ],
  declarations: [MapTableComponent],
  exports: [MapTableComponent]
})
export class MapTableModule { }
