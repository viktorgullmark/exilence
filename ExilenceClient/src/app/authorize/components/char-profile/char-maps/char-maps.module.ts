import { NgModule } from '@angular/core';
import { CharMapsComponent } from './char-maps.component';
import { SharedModule } from '../../../../shared/shared.module';
import { MapTableModule } from '../../map-table/map-table.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatButtonModule } from '@angular/material';
import { InfoDialogComponent } from '../../info-dialog/info-dialog.component';
import { InfoDialogModule } from '../../info-dialog/info-dialog.module';

@NgModule({
  imports: [
    SharedModule,
    MapTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    InfoDialogModule
  ],
  declarations: [CharMapsComponent],
  exports: [CharMapsComponent],
  entryComponents: [InfoDialogComponent]
})
export class CharMapsModule { }
