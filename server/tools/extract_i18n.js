const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "..", "..", "original", "it-it.i18n.js");
const outputPath = path.join(__dirname, "..", "game", "i18n_raw.json");

const code = fs.readFileSync(sourcePath, "utf8");
const sandbox = {};
const wrapped = `(function(){ ${code}; return i18n; })()`;
const i18n = Function("sandbox", `with (sandbox) { return ${wrapped}; }`)(sandbox);

function parseArgs(src) {
  const arrowMatch = src.match(/^\s*(\(([^)]*)\)|([a-zA-Z0-9_]+))\s*=>/);
  if (!arrowMatch) return [];
  const args = arrowMatch[2] || arrowMatch[3] || "";
  return args
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

function fnToObj(fn) {
  const src = fn.toString();
  const args = parseArgs(src);
  const templateMatch = src.match(/`([\s\S]*)`/);
  const template = templateMatch ? templateMatch[1] : src;
  return { __fn__: true, args, template };
}

function transform(value) {
  if (typeof value === "function") return fnToObj(value);
  if (Array.isArray(value)) return value.map(transform);
  if (value && typeof value === "object") {
    const obj = {};
    for (const [key, val] of Object.entries(value)) {
      obj[key] = transform(val);
    }
    return obj;
  }
  return value;
}

const out = transform(i18n);
fs.writeFileSync(outputPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${outputPath}`);
