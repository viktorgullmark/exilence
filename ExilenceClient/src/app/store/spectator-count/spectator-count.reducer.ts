import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AppState, SpectatorCountState } from '../../app.states';
import * as fromActions from './spectator-count.actions';
import * as fromAdapter from './spectator-count.adapter';

export const initialState: SpectatorCountState = fromAdapter.adapter.getInitialState({
    spectatorCount: 0
});

export function spectatorCountReducer(state = initialState, action: fromActions.SPECTATOR_COUNT_ACTIONS): SpectatorCountState {
    switch (action.type) {
        case fromActions.SpectatorCountActionTypes.INCREMENT:
            return {
                ...state,
                spectatorCount: state.spectatorCount + 1,
            };

        case fromActions.SpectatorCountActionTypes.DECREMENT:
            return {
                ...state,
                spectatorCount: state.spectatorCount - 1,
            };

        case fromActions.SpectatorCountActionTypes.UPDATE: {
            return {
                ...state,
                spectatorCount: action.payload.spectatorCount,
            };
        }

        case fromActions.SpectatorCountActionTypes.RESET:
            return {
                ...state,
                spectatorCount: 0,
            };

        default:
            return state;
    }
}

export const getSpectatorState = createFeatureSelector<SpectatorCountState>('spectatorCountState');
export const selectSpectatorCount = createSelector(getSpectatorState,
    (state: SpectatorCountState) => state.spectatorCount
);

