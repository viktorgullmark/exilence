import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity/src/models';
import { PlayerLadder } from '../shared/interfaces/player.interface';

export enum LadderActionTypes {
  ADD_LADDER = '[LADDER] Add Ladder',
  UPDATE_LADDER = '[LADDER] Update Ladder',
  SELECT_LADDER = '[LADDER] Ladder By Name',
}

export class AddLadder implements Action {
  readonly type = LadderActionTypes.ADD_LADDER;
  constructor(public payload: { ladder: PlayerLadder }) { }
}

export class UpdateLadder implements Action {
  readonly type = LadderActionTypes.UPDATE_LADDER;
  constructor(public payload: { ladder: Update<PlayerLadder> }) { }
}

export class SelectLadder implements Action {
  readonly type = LadderActionTypes.SELECT_LADDER;
  constructor(public payload: { ladderName: string }) { }
}

export type LADDER_ACTIONS = AddLadder | UpdateLadder | SelectLadder;
