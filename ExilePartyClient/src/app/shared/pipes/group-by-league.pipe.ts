import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '../interfaces/player.interface';

@Pipe({ name: 'groupByLeague' })
export class GroupByLeaguePipe implements PipeTransform {
    transform(collection: Array<Player>): Array<any> {
        // prevents the application from breaking if the array of objects doesn't exist yet
        if (!collection) {
            return null;
        }

        const groupedCollection = collection.reduce((previous, current) => {
            if (!previous[current.character['league']]) {
                previous[current.character['league']] = [current];
            } else {
                previous[current.character['league']].push(current);
            }

            return previous;
        }, {});

        // this will return an array of objects, each object containing a group of objects
        return Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));
    }
}

import { NgModule } from '@angular/core';

@NgModule({
    imports: [],
    declarations: [GroupByLeaguePipe],
    exports: [GroupByLeaguePipe],
})

export class GroupByLeaguePipeModule {

    static forRoot() {
        return {
            ngModule: GroupByLeaguePipeModule,
            providers: [],
        };
    }
}
