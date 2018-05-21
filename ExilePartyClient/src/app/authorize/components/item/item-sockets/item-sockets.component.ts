import { Component, OnInit, Input } from '@angular/core';
import { Socket } from '../../../../shared/interfaces/socket.interface';

@Component({
  selector: 'app-item-sockets',
  templateUrl: './item-sockets.component.html',
  styleUrls: ['./item-sockets.component.scss']
})
export class ItemSocketsComponent implements OnInit {
  @Input() sockets: Socket[];
  constructor() { }

  ngOnInit() {
  }

}
