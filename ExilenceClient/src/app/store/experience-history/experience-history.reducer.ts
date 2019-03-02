import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromActions from './experience-history.actions';
import * as fromAdapter from './experience-history.adapter';
import { ExperienceHistoryState } from '../../app.states';

export const initialState: ExperienceHistoryState = fromAdapter.adapter.getInitialState({
    experienceHistory: []
});

export function expHistoryReducer(state = initialState, action: fromActions.EXP_HISTORY_ACTIONS): ExperienceHistoryState {
    switch (action.type) {
        case fromActions.ExperienceHistoryActionTypes.UPDATE_EXP_HISTORY: {
            return {
                ...state,
                experienceHistory: [action.payload, ...state.experienceHistory],
            };
        }
        default: {
            return state;
        }
    }
}

export const getExperienceHistoryState = createFeatureSelector<ExperienceHistoryState>('experienceHistoryState');

export const selectExperienceHistory = createSelector(getExperienceHistoryState,
    (state: ExperienceHistoryState) => state
);

