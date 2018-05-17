import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../providers/party.service';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  constructor(private party: PartyService) {
  }

  ngOnInit() {
  }
}
