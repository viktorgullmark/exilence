import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { NotficationBarComponent } from './notfication-bar.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [NotficationBarComponent],
  exports: [NotficationBarComponent]
})
export class NotficationBarModule { }
