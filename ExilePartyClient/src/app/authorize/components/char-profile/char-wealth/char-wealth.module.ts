import { NgModule } from '@angular/core';
import { CharWealthComponent } from './char-wealth.component';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [CharWealthComponent],
  exports: [CharWealthComponent]
})
export class CharWealthModule { }
