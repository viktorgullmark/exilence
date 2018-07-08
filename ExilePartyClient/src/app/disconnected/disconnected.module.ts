import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisconnectedComponent } from './disconnected.component';
import { MatDividerModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatDividerModule
  ],
  declarations: [DisconnectedComponent]
})
export class DisconnectedModule { }
