import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharEquipmentComponent } from './char-equipment.component';
import { ItemModule } from '../item/item.module';
import { EquipmentSlotComponent } from './equipment-slot/equipment-slot.component';

@NgModule({
  imports: [
    CommonModule,
    ItemModule
  ],
  declarations: [CharEquipmentComponent, EquipmentSlotComponent],
  exports: [CharEquipmentComponent, EquipmentSlotComponent]
})
export class CharEquipmentModule { }
