import {Component, HostListener, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {HttpClient} from '@angular/common/http';
import {Parser} from './parser';
import {CONST, FD, MD, Utils} from './mcp';
import {ObservableMedia} from '@angular/flex-layout';
import {MatDrawer, MatSnackBar} from '@angular/material';
import {VirtualScrollComponent} from 'angular2-virtual-scroll';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public opened = true;
  @ViewChild('drawer') drawerRef: MatDrawer;
  @ViewChild(VirtualScrollComponent) virtualScroll: VirtualScrollComponent;
  private itemList: (MD | FD)[];
  public filteredList: (MD | FD)[];
  public selectedItem: MD | FD;
  public keyword = '';
  public clientHeight = document.body.clientHeight;
  public sideMapping = CONST.sideMapping;
  public mcVersion: string;
  public mcpVersion: string;
  public mcpVersions = CONST.mcpVersions;

  constructor(private http: HttpClient,
              private media: ObservableMedia,
              private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    const mcVersionSaved = localStorage.getItem('mcVersion');
    const mcpVersionSaved = localStorage.getItem('mcpVersion');
    if (mcVersionSaved !== null && mcpVersionSaved !== null &&
      this.mcpVersions.filter(v => v.mc === mcVersionSaved && v.mcp === mcpVersionSaved).length > 0) {
      this.mcVersion = mcVersionSaved;
      this.mcpVersion = mcpVersionSaved;
    } else {
      this.mcVersion = this.mcpVersions[0].mc;
      this.mcpVersion = this.mcpVersions[0].mcp;
      this.updateSavedVer();
      console.log('not saved');
    }

    const urls = [`assets/mcp/${this.mcVersion}/joined.exc`,
      `assets/mcp/${this.mcVersion}/joined.srg`,
      `assets/mcp/${this.mcVersion}/${this.mcpVersion}/fields.csv`,
      `assets/mcp/${this.mcVersion}/${this.mcpVersion}/methods.csv`,
      `assets/mcp/${this.mcVersion}/${this.mcpVersion}/params.csv`];
    forkJoin(
      urls.map(url => this.http.get(url, {responseType: 'text'}))
    ).subscribe(([joined_exc, joined_srg, fields_csv, methods_csv, params_csv]) => {
      this.itemList = Parser.parse(joined_exc, joined_srg, fields_csv, methods_csv, params_csv);
      this.updateSelected();
      this.updateFilter();
    });
  }

  updateFilter() {
    this.opened = true;
    if (this.keyword.length > 0) {
      this.filteredList = this.itemList.filter(item => {
        return (item.srg.includes(this.keyword)) ||
          (item.name !== undefined && item.name.includes(this.keyword));
      });
    } else {
      this.filteredList = Array.from(this.itemList);
    }
    this.updateSelected();
  }

  updateSelected() {
    if (this.filteredList !== undefined && this.filteredList.length > 0) {
      this.selectedItem = this.filteredList[0];
    } else {
      this.selectedItem = undefined;
    }
  }

  selectItem(item) {
    this.selectedItem = item;
    if (!this.media.isActive('gt-sm')) {
      this.opened = false;
    }
  }

  onCopied() {
    this.snackBar.open('Copied!', '', {duration: 3000});
  }

  updateVer(ver: { mc: string; mcp: string }) {
    if (this.mcpVersion !== ver.mcp) {
      this.mcVersion = ver.mc;
      this.mcpVersion = ver.mcp;
      this.itemList = [];
      this.filteredList = undefined;
      this.selectedItem = undefined;
      this.updateSavedVer();
      this.ngOnInit();
    }
  }

  updateSavedVer() {
    localStorage.setItem('mcVersion', this.mcVersion);
    localStorage.setItem('mcpVersion', this.mcpVersion);
  }

  @HostListener('window:resize')
  onResize() {
    if (this.virtualScroll) {
      this.clientHeight = document.body.clientHeight;
      this.virtualScroll.refresh();
    }
  }
}

@Pipe({name: 'typeTrans'})
export class TypeTransPipe implements PipeTransform {
  transform(value: string, ...args: any[]): any {
    return Utils.transformType(value);
  }
}
