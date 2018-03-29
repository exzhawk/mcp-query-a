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
}

