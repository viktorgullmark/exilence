import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { ItemSocketsComponent } from './item-sockets/item-sockets.component';
import { SharedModule } from '../../../shared/shared.module';
import { ItemTooltipComponent } from './item-tooltip/item-tooltip.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [ItemComponent, ItemSocketsComponent, ItemTooltipComponent],
  exports: [ItemComponent, ItemSocketsComponent, ItemTooltipComponent]
})
export class ItemModule { }
