import {FD, MD, PM} from './mcp';
import * as Papa from 'papaparse/papaparse.js';

export class Parser {
  static paramRe = new RegExp('\\[*(?:L[^;]*;|[ZBCSIJFDV])', 'g');

  static parse(joined_exc: string, joined_srg: string, fields_csv: string, methods_csv: string, params_csv: string) {
    const fieldsMap = new Map<string, string[]>();
    Papa.parse(fields_csv, {header: true})['data'].forEach((d) => {
      fieldsMap.set(d['searge'], [d['name'], d['side'], d['desc']]);
    });
    const methodsMap = new Map<string, string[]>();
    Papa.parse(methods_csv, {header: true})['data'].forEach((d) => {
      methodsMap.set(d['searge'], [d['name'], d['side'], d['desc']]);
    });
    const pms: PM[] = [];
    // const paramsMap = new Map<string, string[]>();
    Papa.parse(params_csv, {header: true})['data'].forEach((d) => {
      pms.push(new PM(d['param'], d['name'], parseInt(d['side'], 10)));
    });
    const constructorRe = new RegExp('(.*)\\/([^/]*)\\.<init>\\((.*)\\)V=\\|.*');
    const newlineRe = new RegExp('\\r?\\n');
    const constructors = joined_exc.split(newlineRe)
      .map(line => constructorRe.exec(line))
      .filter(a => a !== null)
      .map(a => new MD('', '<init>', a[2], -1, '',
        a[1].replace(/\//g, '.'), this.parseParams(a[3]),
        'V', true));
    const joined_srg_lines = joined_srg.split(newlineRe);
    const mdRe = new RegExp('^MD: (.*) \\(.*\\).* (.*) \\((.*)\\)(.*)$');
    const fdRe = new RegExp('^FD: (.*) (.*)$');
    const syntheticMdRe = new RegExp('^access\\$\\d+$');
    const methods: MD[] = [];
    const fields: FD[] = [];
    for (const line of joined_srg_lines) {
      if (line.startsWith('PK')) {
      } else if (line.startsWith('CL')) {
      } else if (line.startsWith('FD')) {
        const fdA = fdRe.exec(line);
        const pathA = fdA[2].split('/');
        const srg = pathA[pathA.length - 1];
        const path = pathA.slice(0, -1).join('.');
        const fdInfo = fieldsMap.get(srg);
        if (fdInfo === undefined) {
          fields.push(new FD(fdA[1].replace(/\//g, '.'), srg, srg,
            -1, '', path));
        } else {
          fields.push(new FD(fdA[1].replace(/\//g, '.'), srg, fdInfo[0],
            parseInt(fdInfo[1], 10), fdInfo[2].replace(/\\n/g, '\n'), path));
        }
      } else if (line.startsWith('MD')) {
        const mdA = mdRe.exec(line);
        const pathA = mdA[2].split('/');
        const srg = pathA[pathA.length - 1];
        const path = pathA.slice(0, -1).join('.');
        const params = this.parseParams(mdA[3]);
        const mdInfo = methodsMap.get(srg);
        if (syntheticMdRe.exec(srg)) {
          continue;
        }

        if (mdInfo === undefined) {
          methods.push(
            new MD(mdA[1].replace(/\//g, '.'),
              srg, srg, -1, '', path, params, mdA[4], false)
          );
        } else {
          methods.push(
            new MD(mdA[1].replace(/\//g, '.'),
              srg, mdInfo[0], parseInt(mdInfo[1], 10), mdInfo[2].replace(/\\n/g, '\n'),
              path, params, mdA[4], false)
          );
        }
      }
    }
    // return methods.sort(this.sortBySrg);
    return [].concat(methods.sort(this.sortBySrg),
      fields.sort(this.sortBySrg),
      constructors.sort(this.sortBySrg),
      // pms.sort(this.sortBySrg),
      );
  }

  static parseParams(paramsString: string): string[] {
    if (paramsString.length === 0) {
      return [];
    }
    return paramsString.match(this.paramRe);
  }

  static sortBySrg(a, b): number {
    if (a.srg !== b.srg) {
      if (a.srg < b.srg) {
        return -1;
      } else {
        return 1;
      }
    } else if (a.path !== undefined && b.path !== undefined && a.path !== b.path) {
      if (a.path < b.path) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a.name < b.name) {
        return -1;
      } else {
        return 1;
      }
    }
  }

}
