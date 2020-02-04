import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDividerModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatStepperModule
} from "@angular/material";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DeprecationDialogModule } from "../authorize/components/deprecation-dialog/deprecation-dialog.module";
import { DeprecationDialogComponent } from "../authorize/components/deprecation-dialog/deprecation-dialog.component";
import { ErrorMessageDialogComponent } from "../authorize/components/error-message-dialog/error-message-dialog.component";
import { ErrorMessageDialogModule } from "../authorize/components/error-message-dialog/error-message-dialog.module";
import { InfoDialogComponent } from "../authorize/components/info-dialog/info-dialog.component";
import { InfoDialogModule } from "../authorize/components/info-dialog/info-dialog.module";
import { ClearHistoryDialogComponent } from "../shared/components/clear-history-dialog/clear-history-dialog.component";
import { ClearHistoryDialogModule } from "../shared/components/clear-history-dialog/clear-history-dialog.module";
import { SharedModule } from "../shared/shared.module";
import { LoginComponent } from "./login.component";

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
    ClearHistoryDialogModule,
    ErrorMessageDialogModule,
    MatDividerModule,
    MatGridListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    DeprecationDialogModule
  ],
  declarations: [LoginComponent],
  entryComponents: [
    ClearHistoryDialogComponent,
    ErrorMessageDialogComponent,
    InfoDialogComponent,
    DeprecationDialogComponent
  ]
})
export class LoginModule {}
