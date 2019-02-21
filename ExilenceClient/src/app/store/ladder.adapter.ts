import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { PlayerLadder } from '../shared/interfaces/player.interface';

export const adapter: EntityAdapter<PlayerLadder> = createEntityAdapter<PlayerLadder>({
});

export const {
    selectAll: selectAllLadders,
    selectEntities: selectLadderEntities,
} = adapter.getSelectors();
