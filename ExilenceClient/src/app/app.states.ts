
import { EntityState } from '@ngrx/entity';
import { PlayerLadder } from './shared/interfaces/player.interface';
import { DependencyStatus } from './shared/interfaces/dependency-status.interface';
import { SnapshotStatus } from './shared/interfaces/snapshot-status.interface';

export interface AppState {
    ladderState: LadderState;
    spectatorCountState: SpectatorCountState;
    dependencyStatusState: DependencyStatusState;
}

export interface LadderState extends EntityState<PlayerLadder> {
    selectedLadderName: string | null;
}

export interface SpectatorCountState extends EntityState<number> {
    spectatorCount: number | null;
}

export interface SnapshotStatusState extends EntityState<SnapshotStatus> {
    status: SnapshotStatus | null;
}

export interface DependencyStatusState extends EntityState<DependencyStatus> { }
