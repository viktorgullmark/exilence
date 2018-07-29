import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';
import { SessionService } from '../../../../shared/providers/session.service';
import { PartyService } from '../../../../shared/providers/party.service';

@Component({
  selector: 'app-char-inventory',
  templateUrl: './char-inventory.component.html',
  styleUrls: ['./char-inventory.component.scss']
})
export class CharInventoryComponent implements OnInit {
  @Input() items: Item[];
  // default to main-inventory
  @Input() inventoryId = 'MainInventory';
  @Input() width = 12;
  @Input() height = 5;
  @Input() topMargin = 0;
  grid = [];
  sessionIdProvided: boolean;
  constructor(private partyService: PartyService) {
    this.grid = Array(this.width * this.height).fill(0);

    this.partyService.selectedPlayer.subscribe(res => {
      this.sessionIdProvided = res.sessionIdProvided;
    });
  }

  ngOnInit() {
  }

}
