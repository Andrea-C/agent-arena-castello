const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "..", "..");
const originalDir = path.join(baseDir, "original");

global.window = {
  localStorage: {},
  scrollTo: () => {},
};
global.document = {
  title: "",
  body: { classList: { add() {}, remove() {} } },
  querySelectorAll: () => [],
  getElementById: () => ({}),
  addEventListener: () => {},
};

global.CRT = class {
  constructor() {
    this.printDelay = 0;
    this.waitText = "";
    this.capsLock = false;
  }
  async printTyping() {}
  async println() {}
  async print() {}
  async input() {
    return "";
  }
  async clear() {}
  async wait() {}
  async sleep() {}
};

global.Sound = class {};

const vm = require("vm");

const i18nCode = fs.readFileSync(path.join(originalDir, "it-it.i18n.js"), "utf8");
const thesaurusCode = fs.readFileSync(
  path.join(originalDir, "IFEngine", "js", "Thesaurus.js"),
  "utf8"
);
const parserCode = fs.readFileSync(
  path.join(originalDir, "IFEngine", "js", "Parser.js"),
  "utf8"
);
const ifEngineCode = fs.readFileSync(
  path.join(originalDir, "IFEngine", "js", "IFEngine.js"),
  "utf8"
);
const engineCode = fs.readFileSync(
  path.join(originalDir, "AvventuraNelCastelloJSEngine.js"),
  "utf8"
);
const gameCode = fs.readFileSync(
  path.join(originalDir, "AvventuraNelCastelloJS.js"),
  "utf8"
);

const context = {
  console,
  window: global.window,
  document: global.document,
  CRT: global.CRT,
  Sound: global.Sound,
};
vm.createContext(context);
vm.runInContext(i18nCode, context);
vm.runInContext(thesaurusCode, context);
vm.runInContext(parserCode, context);
vm.runInContext(ifEngineCode, context);
vm.runInContext(engineCode, context);
vm.runInContext(gameCode, context);
vm.runInContext("this.Avventura = Avventura;", context);

function fnToObj(fn) {
  return { __fn__: true, source: fn.toString() };
}

function transform(value, seen = new WeakSet()) {
  if (typeof value === "function") return fnToObj(value);
  if (value && typeof value === "object") {
    if (seen.has(value)) return null;
    seen.add(value);
  }
  if (Array.isArray(value)) return value.map((v) => transform(v, seen));
  if (value && typeof value === "object") {
    const obj = {};
    for (const [key, val] of Object.entries(value)) {
      obj[key] = transform(val, seen);
    }
    return obj;
  }
  return value;
}

const game = new context.Avventura();
const out = {
  commonInteractors: transform(game.commonInteractors),
  stanzeComuni: transform(game.stanzeComuni),
  datiAvventura: transform(game.datiAvventura),
  altriDati: transform(game.altriDati),
  datiPunti: transform(game.datiPunti),
};

const outputPath = path.join(baseDir, "server", "game", "game_raw.json");
fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${outputPath}`);
