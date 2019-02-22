import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromActions from './ladder.actions';
import * as fromAdapter from './ladder.adapter';
import { LadderState } from '../../app.states';

export const initialState: LadderState = fromAdapter.adapter.getInitialState({
    selectedLadderName: null
});

export function ladderReducer(state = initialState, action: fromActions.LADDER_ACTIONS): LadderState {
    switch (action.type) {
        case fromActions.LadderActionTypes.ADD_LADDER: {
            return fromAdapter.adapter.addOne(action.payload.ladder, state);
        }
        case fromActions.LadderActionTypes.UPDATE_LADDER: {
            return fromAdapter.adapter.updateOne(action.payload.ladder, state);
        }
        case fromActions.LadderActionTypes.SELECT_LADDER: {
            return Object.assign({ ...state, selectedLadderName: action.payload.ladderName });
        }
        default: {
            return state;
        }
    }
}

export const getSelectedLadderName = (state: LadderState) => state.selectedLadderName;

export const getLadderState = createFeatureSelector<LadderState>('ladderState');
export const selectLadderEntities = createSelector(getLadderState, fromAdapter.selectLadderEntities);
export const selectAllLadders = createSelector(getLadderState, fromAdapter.selectAllLadders);
export const selectCurrentLadderName = createSelector(getLadderState, getSelectedLadderName);

export const selectCurrentLadder = createSelector(
    selectLadderEntities,
    selectCurrentLadderName,
    (ladderEntities, ladderName) => ladderEntities[ladderName]
);

