import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharSummaryComponent } from './char-summary.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CharSummaryComponent],
  exports: [CharSummaryComponent]
})
export class CharSummaryModule { }
