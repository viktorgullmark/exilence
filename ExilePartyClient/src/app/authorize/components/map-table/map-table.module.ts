import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MapTableComponent } from './map-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule, MatSortModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [MapTableComponent],
  exports: [MapTableComponent],
  providers: [DatePipe]
})
export class MapTableModule { }
