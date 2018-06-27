import { NgModule } from '@angular/core';
import { CharMapsComponent } from './char-maps.component';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [CharMapsComponent],
  exports: [CharMapsComponent]
})
export class CharMapsModule { }
