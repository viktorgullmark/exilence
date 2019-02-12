import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { IncomeComponent } from './income.component';
import { SharedModule } from '../../../shared/shared.module';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContextMenuModule } from 'ngx-contextmenu';
import { ServerMessageDialogComponent } from '../server-message-dialog/server-message-dialog.component';
import { ServerMessageDialogModule } from '../server-message-dialog/server-message-dialog.module';

@NgModule({
  imports: [
    SharedModule,
    BrowserModule,
    NgxChartsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ContextMenuModule,
    ServerMessageDialogModule
  ],
  declarations: [
    IncomeComponent
  ],
  exports: [
    IncomeComponent
  ],
  entryComponents: [ServerMessageDialogComponent]
})
export class IncomeModule { }
