import { Action } from '@ngrx/store';
import { SnapshotStatus } from '../../shared/interfaces/snapshot-status.interface';
import { Update } from '@ngrx/entity';

export enum SnapshotStatusActionTypes {
  ADD_SNAPSHOT_STATUS = '[SNAPSHOT_STATUS] Add Snapshot Status',
  UPDATE_SNAPSHOT_STATUS = '[SNAPSHOT_STATUS] Update Snapshot Status'
}

export class AddSnapshotStatus implements Action {
  readonly type = SnapshotStatusActionTypes.ADD_SNAPSHOT_STATUS;
  constructor(public payload: { status: SnapshotStatus }) { }
}

export class UpdateSnapshotStatus implements Action {
  readonly type = SnapshotStatusActionTypes.UPDATE_SNAPSHOT_STATUS;
  constructor(public payload: { status: Update<SnapshotStatus> }) { }
}

export type SNAPSHOT_STATUS_ACTIONS = AddSnapshotStatus | UpdateSnapshotStatus;
