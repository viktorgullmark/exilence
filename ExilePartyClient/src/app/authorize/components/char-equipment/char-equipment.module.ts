import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharEquipmentComponent } from './char-equipment.component';
import { ItemModule } from '../item/item.module';

@NgModule({
  imports: [
    CommonModule,
    ItemModule
  ],
  declarations: [CharEquipmentComponent],
  exports: [CharEquipmentComponent]
})
export class CharEquipmentModule { }
