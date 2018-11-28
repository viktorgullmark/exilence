import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { ItemSocketsComponent } from './item-sockets/item-sockets.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ItemTooltipComponent } from './item-tooltip/item-tooltip.component';
import { ItemTooltipContentComponent } from './item-tooltip/item-tooltip-content/item-tooltip-content.component';
import { ItemService } from './item.service';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [ItemComponent, ItemSocketsComponent, ItemTooltipComponent, ItemTooltipContentComponent],
  exports: [ItemComponent, ItemSocketsComponent, ItemTooltipComponent, ItemTooltipContentComponent],
  providers: [ItemService]
})
export class ItemModule { }
