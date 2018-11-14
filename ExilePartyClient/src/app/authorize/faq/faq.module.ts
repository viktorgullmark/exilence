import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FaqComponent } from './faq.component';
import { MatDividerModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [
    SharedModule,
    MatDividerModule,
    MatExpansionModule
  ],
  declarations: [FaqComponent]
})
export class FaqModule { }
