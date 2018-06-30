import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapTableComponent } from './map-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    MatTableModule
  ],
  declarations: [MapTableComponent],
  exports: [MapTableComponent]
})
export class MapTableModule { }
