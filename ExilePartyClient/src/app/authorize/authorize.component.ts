import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { PartyService } from '../shared/providers/party.service';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  form: FormGroup;
  constructor(@Inject(FormBuilder) fb: FormBuilder, private partyService: PartyService) {
    this.form = fb.group({
      partyCode: ['my-party-name', Validators.required]
    });
  }

  ngOnInit() {
  }

  enterParty() {
    this.partyService.code = this.form.controls.partyCode.value;
  }
}
