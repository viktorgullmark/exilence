import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { scan, shareReplay, startWith } from 'rxjs/operators';
import { SettingsService } from './settings.service';

interface StateObject {
  [prop: string]: any;
}

export interface StateEntry {
  key: string;
  value: any;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private stateSubject = new Subject();
  private initialState: StateObject = { playerLadders: [] };

  constructor(
    private settingsService: SettingsService
  ) {

    // this.initialState.XXX = this.settingsService.get('XXX');


    // Stuff what we always wanna have saved to settings when it changes.
    this.state$.subscribe(state => {
      console.log('State updated: ', state);
      // this.settingsService.set('XXX', null);


    });


  }

  state$ = this.stateSubject.asObservable().pipe(
    scan((currentState: StateObject, newObject: StateObject) => {

      const key = Object.keys(newObject)[0];
      const value = newObject[Object.keys(newObject)[0]];

      if (value === null) {
        delete currentState[key];
        return currentState;
      } else {
        return { ...currentState, ...newObject };
      }


    }, this.initialState),
    startWith(this.initialState),
    shareReplay(1)
  );

  dispatch(obj: StateEntry) {
    if (obj.key !== null && obj.value !== '') {
      this.stateSubject.next({
        [obj.key]: obj.value
      });
    }
  }

}
