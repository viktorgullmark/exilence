import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisconnectedComponent } from './disconnected.component';
import { MatDividerModule, MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatDividerModule,
    MatButtonModule
  ],
  declarations: [DisconnectedComponent]
})
export class DisconnectedModule { }
