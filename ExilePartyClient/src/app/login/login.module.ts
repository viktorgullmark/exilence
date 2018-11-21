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
    LeagueChangedDialogModule
  ],
  declarations: [LoginComponent],
  entryComponents: [LeagueChangedDialogComponent]
})
export class LoginModule { }
