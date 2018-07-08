import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-item-tooltip-content',
  templateUrl: './item-tooltip-content.component.html',
  styleUrls: ['./item-tooltip-content.component.scss']
})
export class ItemTooltipContentComponent implements OnInit {
  @Input() item: Item;
  constructor() { }

  ngOnInit() {
  }

  getExplicitModClass(explicit) {
    let modClass = '';
    if (explicit.indexOf('to maximum Life') >= 0) {
      modClass = 'life';
    }
    if (explicit.indexOf('to Cold Resistance') >= 0) {
      modClass = 'cold-res';
    }
    if (explicit.indexOf('to Fire Resistance') >= 0) {
      modClass = 'fire-res';
    }
    if (explicit.indexOf('to Lightning Resistance') >= 0) {
      modClass = 'lightning-res';
    }
    if (explicit.indexOf('to Chaos Resistance') >= 0) {
      modClass = 'chaos-res';
    }
    if (explicit.indexOf('to maximum Mana') >= 0) {
      modClass = 'mana';
    }

    // todo: append div card classes

    return modClass;
  }

  formatDivCard(text) {

    // todo: format div card

    return text;
  }

  formatFlaskProperties(prop, firstVal, secondVal) {
    const ex = /(%0)/g;
    let result = prop.replace(ex, firstVal);

    if (secondVal !== undefined && secondVal[0] !== undefined) {
      // use second value as well
      const ex2 = /(%1)/g;
      result = result.replace(ex2, secondVal[0]);
    }

    return result;
  }
}
