import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { ExperienceHistory } from '../../shared/interfaces/experience-history.interface';

export const adapter: EntityAdapter<ExperienceHistory[]> = createEntityAdapter<ExperienceHistory[]>({
});

export const {
} = adapter.getSelectors();
