import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharEquipmentComponent } from './char-equipment.component';
import { ItemModule } from '../item/item.module';
import { EquipmentSlotComponent } from './equipment-slot/equipment-slot.component';
import { InfoDialogModule } from '../../info-dialog/info-dialog.module';
import { InfoDialogComponent } from '../../info-dialog/info-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    ItemModule,
    InfoDialogModule
  ],
  declarations: [CharEquipmentComponent, EquipmentSlotComponent],
  exports: [CharEquipmentComponent, EquipmentSlotComponent],
  entryComponents: [InfoDialogComponent]
})
export class CharEquipmentModule { }
