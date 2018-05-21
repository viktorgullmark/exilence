import { NgModule } from '@angular/core';
import { ItemComponent } from './item.component';
import { ItemSocketsComponent } from './item-sockets/item-sockets.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [ItemComponent, ItemSocketsComponent],
  exports: [ItemComponent, ItemSocketsComponent]
})
export class ItemModule { }
