
import { EntityState } from '@ngrx/entity';
import { PlayerLadder } from './shared/interfaces/player.interface';

export interface AppState {
    ladderState: LadderState;
}

export interface LadderState extends EntityState<PlayerLadder> {
    selectedLadderName: string | null;
}
