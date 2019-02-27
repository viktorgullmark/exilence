import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromActions from './snapshot-status.actions';
import * as fromAdapter from './snapshot-status.adapter';
import { SnapshotStatusState } from '../../app.states';

export const initialState: SnapshotStatusState = fromAdapter.adapter.getInitialState({
    status: {
        running: false,
        failed: false,
        started: undefined,
        finished: undefined
    }
});

export function snapshotStatusReducer(state = initialState, action: fromActions.SNAPSHOT_STATUS_ACTIONS): SnapshotStatusState {
    switch (action.type) {
        case fromActions.SnapshotStatusActionTypes.ADD_SNAPSHOT_STATUS: {
            return fromAdapter.adapter.addOne(action.payload.status, state);
        }
        case fromActions.SnapshotStatusActionTypes.UPDATE_SNAPSHOT_STATUS: {
            return fromAdapter.adapter.updateOne(action.payload.status, state);
        }
        default: {
            return state;
        }
    }
}

export const getSnapshotStatus = createFeatureSelector<SnapshotStatusState>('snapshotStatusState');
export const selectSnapshotStatus = createSelector(getSnapshotStatus,
    (state: SnapshotStatusState) => state.status
);

