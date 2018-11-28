import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharInventoryComponent } from './char-inventory.component';
import { ItemModule } from '../item/item.module';
import { SharedModule } from '../../../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    SharedModule,
    ItemModule,
    MatIconModule
  ],
  declarations: [CharInventoryComponent],
  exports: [CharInventoryComponent]
})
export class CharInventoryModule { }
