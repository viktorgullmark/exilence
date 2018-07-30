import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ErrorMessage } from '../interfaces/error-message.interface';

@Injectable()
export class ErrorService {
  public error: BehaviorSubject<ErrorMessage> = new BehaviorSubject<ErrorMessage>(undefined);
  constructor() {
  }

  showError(errorMsg: ErrorMessage) {
    this.error.next(errorMsg);
  }
}
