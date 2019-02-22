import { createFeatureSelector } from '@ngrx/store';

import { SpectatorCountState } from '../../app.states';
import * as fromActions from './spectator-count.actions';
import * as fromAdapter from './spectator-count.adapter';

export const initialState: SpectatorCountState = fromAdapter.adapter.getInitialState({
    spectatorCount: 0
});

export function spectatorCountReducer(state = initialState, action: fromActions.SPECTATOR_COUNT_ACTIONS): SpectatorCountState {
    switch (action.type) {
        case fromActions.SpectatorCountActionTypes.Increment:
            state.spectatorCount += 1;
            return state;

        case fromActions.SpectatorCountActionTypes.Decrement:
            state.spectatorCount -= 1;
            return state;

        case fromActions.SpectatorCountActionTypes.Reset:
            state.spectatorCount = 0;
            return state;

        default:
            return state;
    }
}

export const getSpectatorCountState = createFeatureSelector<SpectatorCountState>('spectatorCountState');

