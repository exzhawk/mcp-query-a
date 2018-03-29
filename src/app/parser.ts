import {FD, MD} from './mcp';
import * as Papa from 'papaparse/papaparse.min.js';

export class Parser {
  static java_type = {
    Z: 'boolean',
    B: 'byte',
    C: 'char',
    S: 'short',
    I: 'int',
    J: 'long',
    F: 'float',
    D: 'double',
    V: 'void',
  };
  static paramRe = new RegExp('\\[*(?:L[^;]*;|[ZBCSIJFDV])', 'g');

  static parse(joined_exc: string, joined_srg: string, fields_csv: string, methods_csv: string, params_csv: string) {
    const fieldsMap = new Map<string, string[]>();
    fields_csv.split('\r\n')
      .slice(1)
      .map(line => {
        const [srg, name, side, desc] = line.split(',');
        fieldsMap.set(srg, [name, side, desc]);
        if (srg === 'func_99999_d') {
          console.log(line);
        }
      });
    const methodsMap = new Map<string, string[]>();
    Papa.parse(methods_csv, {header: true})['data'].forEach((d) => {
      methodsMap.set(d['searge'], [d['name'], d['side'], d['desc']]);
    });
    const paramsMap = new Map<string, string[]>();
    params_csv.split('\r\n')
      .slice(1)
      .map(line => {
        const [srg, name, side] = line.split(',');
        paramsMap.set(srg, [name, side]);
      });

    const constructorRe = new RegExp('(.*)\\/([^/]*)\\.<init>\\((.*)\\)V=\\|.*');
    const constructors = joined_exc.split('\r\n')
      .map(line => constructorRe.exec(line))
      .filter(a => a !== null)
      .map(a => new MD('', '', a[2], 0, '', a[1].replace(/\//g, '.'), this.parseParam(a[3]), 'V', true));

    const joined_srg_lines = joined_srg.split('\r\n');
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
          fields.push(new FD(fdA[1].replace('/', '.'), srg, srg, 0, '', path));
        } else {
          fields.push(new FD(fdA[1].replace('/', '.'), srg, fdInfo[0], fdInfo[1], fdInfo[2], path));
        }
      } else if (line.startsWith('MD')) {
        const mdA = mdRe.exec(line);
        const pathA = mdA[2].split('/');
        const srg = pathA[pathA.length - 1];
        const path = pathA.slice(0, -1).join('.');
        const params = this.parseParam(mdA[3]);
        const mdInfo = methodsMap.get(srg);
        if (syntheticMdRe.exec(srg)) {
          continue;
        }

        if (mdInfo === undefined) {
          methods.push(new MD(mdA[1].replace('/', '.'), srg, srg, 0, '', path, params, mdA[4], false));
        } else {
          methods.push(new MD(mdA[1].replace('/', '.'), srg, mdInfo[0], mdInfo[1], mdInfo[2], path, params, mdA[4], false));
        }
      }
    }
    return methods.sort(this.sortBySrg);

  }

  static parseParam(paramString: string): string[] {
    if (paramString.length === 0) {
      return [];
    }
    return paramString.match(this.paramRe);
  }

  static sortBySrg(a, b): number {
    return (a.srg < b.srg) ? -1 : (a.srg > b.srg) ? 1 : 0;
  }
}
