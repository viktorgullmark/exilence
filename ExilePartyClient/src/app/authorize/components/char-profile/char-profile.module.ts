import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharProfileComponent } from './char-profile.component';
import { CharInventoryModule } from './char-inventory/char-inventory.module';
import { CharEquipmentModule } from './char-equipment/char-equipment.module';

@NgModule({
  imports: [
    CommonModule,
    CharInventoryModule,
    CharEquipmentModule
  ],
  declarations: [CharProfileComponent],
  exports: [CharProfileComponent]
})
export class CharProfileModule { }
