import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharInventoryComponent } from './char-inventory.component';
import { ItemModule } from '../item/item.module';

@NgModule({
  imports: [
    CommonModule,
    ItemModule
  ],
  declarations: [CharInventoryComponent],
  exports: [CharInventoryComponent]
})
export class CharInventoryModule { }
