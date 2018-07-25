import { NgModule } from '@angular/core';
import { CharMapsComponent } from './char-maps.component';
import { SharedModule } from '../../../../shared/shared.module';
import { MapTableModule } from '../../map-table/map-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    SharedModule,
    MapTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [CharMapsComponent],
  exports: [CharMapsComponent]
})
export class CharMapsModule { }
