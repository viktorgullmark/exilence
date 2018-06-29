import { NgModule } from '@angular/core';
import { CharMapsComponent } from './char-maps.component';
import { SharedModule } from '../../../../shared/shared.module';
import { MapTableModule } from '../../map-table/map-table.module';

@NgModule({
  imports: [
    SharedModule,
    MapTableModule
  ],
  declarations: [CharMapsComponent],
  exports: [CharMapsComponent]
})
export class CharMapsModule { }
