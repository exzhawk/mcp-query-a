export class MD {
  // notch: string;
  srg: string;
  side: number;
  desc: string;
  name: string;
  path: string;
  params: string[];
  ret: string;
  init: boolean;
  selected = false;

  constructor(srg, name, side, desc, path, params, ret, init) {
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
  // notch: string;
  srg: string;
  side: number;
  desc: string;
  name: string;
  path: string;

  constructor(srg, name, side, desc, path) {
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

