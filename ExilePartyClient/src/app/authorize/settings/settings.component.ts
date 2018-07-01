import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { StashtabListComponent } from '../components/stashtab-list/stashtab-list.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;

  @ViewChild('table') table: StashtabListComponent;

  constructor(@Inject(FormBuilder) fb: FormBuilder) {
    this.form = fb.group({
      searchText: ['']
    });
  }

  ngOnInit() {
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }
}
