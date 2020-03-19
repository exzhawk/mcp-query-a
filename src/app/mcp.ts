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
  type: string;

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
    this.type = init ? 'Constructor' : 'Function';
  }
}

export class FD {
  notch: string;
  srg: string;
  side: number;
  desc: string;
  name: string;
  path: string;
  type: string;

  constructor(notch, srg, name, side, desc, path) {
    this.notch = notch;
    this.srg = srg;
    this.side = side;
    this.desc = desc;
    this.name = name;
    this.path = path;
    this.type = 'Field';
  }
}

export class PM {
  srg: string;
  name: string;
  side: number;
  type: string;

  constructor(srg, name, side) {
    this.srg = srg;
    this.name = name;
    this.side = side;
    this.type = 'Param';
  }
}

export class Version {
  mc: string;
  mcp: string;
}

export class CONST {
  static sideMapping = new Map([[-1, 'Unknown'], [0, 'Client'], [1, 'Server'], [2, 'Both']]);
  static mcpVersions = [
    {mc: '1.12.2', mcp: 'stable-39'},
    // {mc: '1.13.2', mcp: 'snapshot-20190323'},
    {mc: '1.12', mcp: 'stable-39'},
    {mc: '1.11.2', mcp: 'stable-32'},
    {mc: '1.10', mcp: 'stable-29'},
    {mc: '1.9.4', mcp: 'stable-26'},
    {mc: '1.8.8', mcp: 'stable-20'},
    {mc: '1.7.10', mcp: 'stable-12'},
  ];
  static defaultMcpVersionIndex = 0;
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
