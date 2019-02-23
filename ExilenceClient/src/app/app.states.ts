
import { EntityState } from '@ngrx/entity';
import { PlayerLadder } from './shared/interfaces/player.interface';

export interface AppState {
    ladderState: LadderState;
    spectatorCountState: SpectatorCountState;
}

export interface LadderState extends EntityState<PlayerLadder> {
    selectedLadderName: string | null;
}

export interface SpectatorCountState extends EntityState<number> {
    spectatorCount: number | null;
}
