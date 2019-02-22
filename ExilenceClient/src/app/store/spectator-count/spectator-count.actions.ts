import { Action } from '@ngrx/store';

export enum SpectatorCountActionTypes {
  Increment = '[SPECTATOR_COUNT] Increment',
  Decrement = '[SPECTATOR_COUNT] Decrement',
  Reset = '[SPECTATOR_COUNT] Reset',
}

export class Increment implements Action {
  readonly type = SpectatorCountActionTypes.Increment;
}
export class Decrement implements Action {
  readonly type = SpectatorCountActionTypes.Decrement;
}
export class Reset implements Action {
  readonly type = SpectatorCountActionTypes.Reset;
}
export type SPECTATOR_COUNT_ACTIONS = Increment | Decrement | Reset;
