export class MD {
  notch: string;
  srg: string;
  side: number;
  desc: string;
  name: string;
  path: string;
  params: string[];
  ret: string;
  init: boolean;
  selected = false;

  constructor(notch, srg, name, side, desc, path, params, ret, init) {
    this.notch = notch;
    this.srg = srg;
    this.side = side;
    this.desc = desc;
    this.name = name;
    this.path = path;
    this.params = params;
    this.ret = ret;
    this.init = init;
  }
}

export class FD {
  notch: string;
  srg: string;
  side: number;
  desc: string;
  name: string;
  path: string;

  constructor(notch, srg, name, side, desc, path) {
    this.notch = notch;
    this.srg = srg;
    this.side = side;
    this.desc = desc;
    this.name = name;
    this.path = path;
  }
}

export class PM {
  srg: string;
  name: string;
  side: number;

  constructor(srg, name, side) {
    this.srg = srg;
    this.name = name;
    this.side = side;
  }
}

export class CONST {
  static sideMapping = new Map([[-1, 'Unknown'], [0, 'Client'], [1, 'Server'], [2, 'Both']]);
  static mcpVersions = [
    {mc: '1.12', mcp: 'snapshot-20180331'},
    {mc: '1.11.2', mcp: 'stable-32'},
    {mc: '1.10', mcp: 'stable-29'},
    {mc: '1.9.4', mcp: 'stable-26'},
    {mc: '1.8.8', mcp: 'stable-20'},
    {mc: '1.7.10', mcp: 'stable-12'},
  ];
}

export class Utils {
  static javaTypesMapping = new Map<string, string>([
    ['Z', 'boolean'],
    ['B', 'byte'],
    ['C', 'char'],
    ['S', 'short'],
    ['I', 'int'],
    ['J', 'long'],
    ['F', 'float'],
    ['D', 'double'],
    ['V', 'void'],
  ]);
  static arrayDetectRe = new RegExp('^(\\[*)(.*)$');

  static getType(item: (MD | FD | PM)): string {
    if (item instanceof MD) {
      if (item.init === true) {
        return 'Constructor';
      } else {
        return 'Function';
      }

    } else if (item instanceof FD) {
      return 'Field';
    } else {
      return 'Param';
    }

  }

  static transformType(paramString: string): string {
    let transformed: string;
    const [, arrayD, rest] = this.arrayDetectRe.exec(paramString);
    const suffix = '[]'.repeat(arrayD.length);
    if (this.javaTypesMapping.has(rest)) {
      transformed = this.javaTypesMapping.get(rest);
    } else if (rest.startsWith('L') && rest.endsWith(';')) {
      transformed = rest.slice(1, -1).replace(/\//g, '.');
    }
    return transformed + suffix;
  }
}
