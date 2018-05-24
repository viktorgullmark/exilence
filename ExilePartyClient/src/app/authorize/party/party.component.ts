import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../shared/providers/party.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit {

  constructor(private partyService: PartyService) { }

  ngOnInit() {
  }

}
