import {Component, OnInit, ViewChild} from '@angular/core';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {HttpClient} from '@angular/common/http';
import {Parser} from './parser';
import {FD, MD} from './mcp';
import {ObservableMedia} from '@angular/flex-layout';
import {MatDrawer, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public opened = true;
  @ViewChild('drawer') drawerRef: MatDrawer;
  private methods: MD[];
  public filteredMethods: MD[];
  private fields: FD[];
  // public filteredFields: FD[];
  public keyword: string;
  public clientHeight = document.body.clientHeight;
  public selectedMethod: MD;

  constructor(private http: HttpClient,
              private media: ObservableMedia,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    const urls = ['assets/joined.exc', 'assets/joined.srg', 'assets/fields.csv', 'assets/methods.csv', 'assets/params.csv'];
    forkJoin(
      urls.map(url => this.http.get(url, {responseType: 'text'}))
    ).subscribe(([joined_exc, joined_srg, fields_csv, methods_csv, params_csv]) => {
      this.methods = Parser.parse(joined_exc, joined_srg, fields_csv, methods_csv, params_csv);
      this.filteredMethods = Array.from(this.methods);
      this.updateSelected();
      // this.filteredFields = Array.from(this.fields);
    });
  }

  updateFilter() {
    this.opened = true;
    this.filteredMethods = this.methods.filter(method => method.srg.includes(this.keyword));
    this.updateSelected();
  }

  updateSelected() {
    if (this.filteredMethods !== undefined && this.filteredMethods.length > 0) {
      this.selectedMethod = this.filteredMethods[0];
    } else {
      this.selectedMethod = undefined;
    }
  }

  selectMethod(method) {
    this.selectedMethod = method;
    if (!this.media.isActive('gt-sm')) {
      this.opened = false;
    }
  }

  onCopied() {
    this.snackBar.open('Copied!', '', {duration: 3000});
  }
}

