import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SpectatorCountState } from '../../app.states';
import * as fromActions from './spectator-count.actions';
import * as fromAdapter from './spectator-count.adapter';

export const initialState: SpectatorCountState = fromAdapter.adapter.getInitialState({
    spectatorCount: 0
});

export function spectatorCountReducer(state = initialState, action: fromActions.SPECTATOR_COUNT_ACTIONS): SpectatorCountState {
    switch (action.type) {
        case fromActions.SpectatorCountActionTypes.INCREMENT:
            state.spectatorCount += 1;
            return state;

        case fromActions.SpectatorCountActionTypes.DECREMENT:
            state.spectatorCount -= 1;
            return state;

        case fromActions.SpectatorCountActionTypes.UPDATE: {
            state.spectatorCount = action.payload.spectatorCount;
            return state;
        }

        case fromActions.SpectatorCountActionTypes.RESET:
            state.spectatorCount = 0;
            return state;

        default:
            return state;
    }
}

export const getSpectatorCountState = createFeatureSelector<SpectatorCountState>('spectatorCountState');

export const getSpectatorCount = (state: SpectatorCountState) => state.spectatorCount;

export const selectSpectatorCount = createSelector(getSpectatorCountState, getSpectatorCount);
