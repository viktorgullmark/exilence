import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AlertMessage } from '../interfaces/alert-message.interface';

@Injectable()
export class AlertService {
  public alert: BehaviorSubject<AlertMessage> = new BehaviorSubject<AlertMessage>(undefined);
  constructor() {
  }

  showAlert(alertMsg: AlertMessage) {
    this.alert.next(alertMsg);
  }
}
