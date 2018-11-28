import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatInputModule, MatOptionModule, MatSelectModule, MatIconModule,
  MatStepperModule, MatProgressBarModule, MatCheckboxModule, MatRadioModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';

import { LoginComponent } from './login.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeagueChangedDialogModule } from '../shared/components/league-changed-dialog/league-changed-dialog.module';
import { LeagueChangedDialogComponent } from '../shared/components/league-changed-dialog/league-changed-dialog.component';
import { InfoDialogComponent } from '../authorize/components/info-dialog/info-dialog.component';
import { InfoDialogModule } from '../authorize/components/info-dialog/info-dialog.module';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatStepperModule,
    MatButtonModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    InfoDialogModule,
    LeagueChangedDialogModule
  ],
  declarations: [LoginComponent],
  entryComponents: [LeagueChangedDialogComponent, InfoDialogComponent]
})
export class LoginModule { }
