import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity/src/models';
import { ExperienceHistory } from '../../shared/interfaces/experience-history.interface';

export enum ExperienceHistoryActionTypes {
  UPDATE_EXP_HISTORY = '[EXP_HISTORY] Update Experience History'
}

export class UpdateExperienceHistory implements Action {
  readonly type = ExperienceHistoryActionTypes.UPDATE_EXP_HISTORY;
  constructor(public payload: ExperienceHistory) { }
}

export type EXP_HISTORY_ACTIONS = UpdateExperienceHistory;
