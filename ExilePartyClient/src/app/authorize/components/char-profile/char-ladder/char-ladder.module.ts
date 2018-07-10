import { NgModule } from '@angular/core';
import { CharLadderComponent } from './char-ladder.component';
import { SharedModule } from '../../../../shared/shared.module';
import { LadderTableModule } from '../../ladder-table/ladder-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    SharedModule,
    LadderTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  declarations: [CharLadderComponent],
  exports: [CharLadderComponent]
})
export class CharLadderModule { }
