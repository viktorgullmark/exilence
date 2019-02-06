import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupname' })
export class GroupNamePipe implements PipeTransform {
  transform(groupname: string) {
    return groupname.replace(/[^a-zA-Z0-9]/g, '');
  }
}
