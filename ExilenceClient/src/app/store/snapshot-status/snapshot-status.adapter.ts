import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { SnapshotStatus } from '../../shared/interfaces/snapshot-status.interface';

export const adapter: EntityAdapter<SnapshotStatus> = createEntityAdapter<SnapshotStatus>({

});

export const {
} = adapter.getSelectors();
