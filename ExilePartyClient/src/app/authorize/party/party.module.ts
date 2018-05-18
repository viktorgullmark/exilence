import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { PartyComponent } from './party.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [PartyComponent]
})
export class PartyModule { }
