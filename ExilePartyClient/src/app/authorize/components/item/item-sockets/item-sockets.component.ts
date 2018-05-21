import { Component, OnInit, Input } from '@angular/core';
import { Socket } from '../../../../shared/interfaces/socket.interface';
import { Item } from '../../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-item-sockets',
  templateUrl: './item-sockets.component.html',
  styleUrls: ['./item-sockets.component.scss']
})
export class ItemSocketsComponent implements OnInit {
  @Input() sockets: Socket[];
  @Input() gems: Item[];
  @Input() columns: number;
  constructor() { }

  ngOnInit() {
    console.log(this.gems);
  }

  getGemByIndex(index) {
    return this.gems.find(x => x.socket === index);
  }
}