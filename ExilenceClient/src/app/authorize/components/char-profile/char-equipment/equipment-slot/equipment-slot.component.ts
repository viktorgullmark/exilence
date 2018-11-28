import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-equipment-slot',
  templateUrl: './equipment-slot.component.html',
  styleUrls: ['./equipment-slot.component.scss']
})
export class EquipmentSlotComponent implements OnInit {
  @Input() slot: any;
  @Input() item: Item;
  constructor() { }

  ngOnInit() {
  }

}
