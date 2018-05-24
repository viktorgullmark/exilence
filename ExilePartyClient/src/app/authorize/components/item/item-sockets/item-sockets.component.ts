import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Socket } from '../../../../shared/interfaces/socket.interface';
import { Item } from '../../../../shared/interfaces/item.interface';
import { ItemService } from '../item.service';

@Component({
  selector: 'app-item-sockets',
  templateUrl: './item-sockets.component.html',
  styleUrls: ['./item-sockets.component.scss']
})
export class ItemSocketsComponent implements OnInit {
  @Input() sockets: Socket[];
  @Input() gems: Item[];
  @Input() columns: number;
  @Output() updated: EventEmitter<any> = new EventEmitter;

  constructor(private itemService: ItemService) { }

  ngOnInit() {
  }

  selectGem(gem: Item) {
    this.itemService.selectGem(gem);
    this.updated.emit();
  }

  deselectGem() {
    this.itemService.deselectGem();
  }

  getGemByIndex(index) {
    return this.gems.find(x => x.socket === index);
  }
}
