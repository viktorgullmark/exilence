import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { ladderReducer } from './ladder.reducer';

@NgModule({
  imports: [
    StoreModule.forRoot({ count: ladderReducer })
  ]
})
export class LadderStoreModule {}
