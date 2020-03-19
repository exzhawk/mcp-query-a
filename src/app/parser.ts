import {FD, MD} from './mcp';
import * as Papa from 'papaparse/papaparse.js';

export class Parser {
  static paramRe = new RegExp('\\[*(?:L[^;]*;|[ZBCSIJFDV])', 'g');
  static newlineRe = new RegExp('\\r?\\n');
  static syntheticMdRe = new RegExp('^access\\$\\d+$');

  // noinspection JSUnusedLocalSymbols
  static parseMapping(fieldsCsv: string, methodsCsv: string, paramsCsv: string) {
    const fieldsMap = new Map<string, string[]>();
    Papa.parse(fieldsCsv, {header: true})['data'].forEach((d) => {
      fieldsMap.set(d['searge'], [d['name'], d['side'], d['desc']]);
    });
    const methodsMap = new Map<string, string[]>();
    Papa.parse(methodsCsv, {header: true})['data'].forEach((d) => {
      methodsMap.set(d['searge'], [d['name'], d['side'], d['desc']]);
    });
    // const pms: PM[] = [];
    // const paramsMap = new Map<string, string[]>();
    // Papa.parse(paramsCsv, {header: true})['data'].forEach((d) => {
    //   pms.push(new PM(d['param'], d['name'], parseInt(d['side'], 10)));
    // });
    return [fieldsMap, methodsMap];
  }

  static parseLe112(fieldsCsv: string, methodsCsv: string, paramsCsv: string, joinedExc: string, joinedSrg: string) {
    const [fieldsMap, methodsMap] = this.parseMapping(fieldsCsv, methodsCsv, paramsCsv);

    const constructorRe = new RegExp('(.*)\\/([^/]*)\\.<init>\\((.*)\\)V=\\|.*');
    const constructors = joinedExc.split(this.newlineRe)
      .map(line => constructorRe.exec(line))
      .filter(a => a !== null)
      .map(a => new MD('', '<init>', a[2], -1, '',
        a[1].replace(/\//g, '.'), this.parseParams(a[3]),
        'V', true));

    const joinedSrgLines = joinedSrg.split(this.newlineRe);
    const mdRe = new RegExp('^MD: (.*) \\(.*\\).* (.*) \\((.*)\\)(.*)$');
    const fdRe = new RegExp('^FD: (.*) (.*)$');
    const methods: MD[] = [];
    const fields: FD[] = [];
    for (const line of joinedSrgLines) {
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
        if (this.syntheticMdRe.exec(srg)) {
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

    return [].concat(
      methods.sort(this.sortBySrg),
      fields.sort(this.sortBySrg),
      constructors.sort(this.sortBySrg),
    );
  }

  static parse(fieldsCsv: string, methodsCsv: string, paramsCsv: string, constructorsTxt: string, joinedTsrg: string) {
    const [fieldsMap, methodsMap] = this.parseMapping(fieldsCsv, methodsCsv, paramsCsv);

    const classes: Map<string, string> = new Map<string, string>();
    for (const line of joinedTsrg.split(this.newlineRe)) {
      if (!line.startsWith('\t')) {
        const [notch, classPath] = line.split(' ');
        if (classPath === undefined) {
          continue;
        }
        classes.set(notch, classPath);
      }
    }

    let lastPath = '';
    let lastNotch = '';
    const mdSignatureRe = new RegExp('\\((.*)\\)(.*)');
    const fields: FD[] = [];
    const methods: MD[] = [];
    for (const line of joinedTsrg.split(this.newlineRe)) {
      if (!line.startsWith('\t')) {
        [lastNotch, lastPath] = line.split(' ');
        if (lastPath === undefined) {
          continue;
        }
        lastPath = lastPath.replace(/\//g, '.');
      } else {
        const members = line.trim().split(' ');
        if (members.length === 2) {
          const [notch, srg] = members;
          const fdInfo = fieldsMap.get(srg);
          if (fdInfo === undefined) {
            fields.push(new FD([lastNotch, notch].join('.'), srg, srg, -1, '', lastPath));
          } else {
            fields.push(new FD([lastNotch, notch].join('.'), srg, fdInfo[0],
              parseInt(fdInfo[1], 10), fdInfo[2].replace(/\\n/g, '\n'), lastPath));
          }
        } else {
          const [notch, signature, srg] = members;
          const mdInfo = methodsMap.get(srg);
          const signatureA = mdSignatureRe.exec(signature);
          const params = this.parseParams(signatureA[1], classes);
          let ret = signatureA[2];
          if (ret.startsWith('L')) {
            const retClassNotch = ret.slice(1, -1);
            ret = 'L' + (classes.get(retClassNotch) || retClassNotch) + ';';
          }
          if (this.syntheticMdRe.exec(srg)) {
            continue;
          }
          if (mdInfo === undefined) {
            methods.push(new MD([lastNotch, notch].join('.'), srg, srg, -1, '', lastPath, params, ret, false));
          } else {
            methods.push(new MD([lastNotch, notch].join('.'), srg, mdInfo[0], parseInt(mdInfo[1], 10),
              mdInfo[2].replace(/\\n/g, '\n'),
              lastPath, params, ret, false));
          }
        }
      }
    }

    const constructorRe2 = new RegExp('\\d+ (.*)\\/([^/]*)\\((.*)\\)(.*)');
    const constructors = constructorsTxt.split(this.newlineRe)
      .map(line => constructorRe2.exec(line))
      .filter(a => a !== null)
      .map(a => new MD('', '<init>', a[2], -1, '', a[1].replace(/\//g, '.'),
        this.parseParams(a[3], classes), 'V', true));

    return [].concat(
      methods.sort(this.sortBySrg),
      fields.sort(this.sortBySrg),
      constructors.sort(this.sortBySrg),
    );
  }

  static parseParams(paramsString: string, classMap?: Map<string, string>): string[] {
    if (paramsString.length === 0) {
      return [];
    }
    const params = paramsString.match(this.paramRe);
    if (classMap === undefined) {
      return params;
    } else {
      return params.map(
        p => {
          if (p.startsWith('L')) {
            const classNotch = p.slice(1, -1);
            p = 'L' + (classMap.get(classNotch) || classNotch) + ';';
          }
          return p;
        }
      );
    }
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
