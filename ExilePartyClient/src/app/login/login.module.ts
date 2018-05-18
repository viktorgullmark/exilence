import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatInputModule, MatOptionModule, MatSelectModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';

import { LoginComponent } from './login.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
