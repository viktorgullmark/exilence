import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../shared/providers/party.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit {
  isLoading = true;
  constructor() { }

  ngOnInit() {
    // give the profile time to render
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

}
