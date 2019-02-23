import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

export const adapter: EntityAdapter<number> = createEntityAdapter<number>({

});

export const {
} = adapter.getSelectors();
