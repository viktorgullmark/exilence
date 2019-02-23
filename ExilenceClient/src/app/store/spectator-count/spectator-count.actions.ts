import { Action } from '@ngrx/store';

export enum SpectatorCountActionTypes {
  INCREMENT = '[SPECTATOR_COUNT] Increment',
  DECREMENT = '[SPECTATOR_COUNT] Decrement',
  UPDATE = '[SPECTATOR_COUNT] Update',
  RESET = '[SPECTATOR_COUNT] Reset',
}

export class Increment implements Action {
  readonly type = SpectatorCountActionTypes.INCREMENT;
}
export class Decrement implements Action {
  readonly type = SpectatorCountActionTypes.DECREMENT;
}
export class Update implements Action {
  readonly type = SpectatorCountActionTypes.UPDATE;
  constructor(public payload: { spectatorCount: number }) { }
}
export class Reset implements Action {
  readonly type = SpectatorCountActionTypes.RESET;
}
export type SPECTATOR_COUNT_ACTIONS = Increment | Decrement | Update | Reset;
