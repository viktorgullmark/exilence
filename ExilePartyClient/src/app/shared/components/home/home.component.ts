import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../providers/signalr.service';

@Component({
  selector: 'app-home-component',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit {

  constructor(private signalR: SignalRService) {
  }

  ngOnInit() {
  }
}
