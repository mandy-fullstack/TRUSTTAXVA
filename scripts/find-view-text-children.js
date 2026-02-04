/* eslint-disable no-console */
// Finds raw JSX text nodes under <View> in apps/web-client/src, which can crash react-native-web:
// "Unexpected text node: ... A text node cannot be a child of a <View>."
//
// Usage:
//   node scripts/find-view-text-children.js

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const TARGET = path.join(ROOT, "apps", "web-client", "src");

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, out);
    } else if (e.isFile() && (p.endsWith(".tsx") || p.endsWith(".ts"))) {
      out.push(p);
    }
  }
  return out;
}

function isTagName(node, name) {
  if (!node) return false;
  if (ts.isIdentifier(node) && node.text === name) return true;
  // <Foo.Bar> etc not relevant for View
  return false;
}

function isTCall(expr) {
  if (!expr) return false;
  if (!ts.isCallExpression(expr)) return false;
  const callee = expr.expression;
  return ts.isIdentifier(callee) && callee.text === "t";
}

function isStringyExpression(expr) {
  if (!expr) return false;
  return (
    ts.isStringLiteral(expr) ||
    ts.isNoSubstitutionTemplateLiteral(expr) ||
    ts.isTemplateExpression(expr)
  );
}

function getLineCol(sf, pos) {
  const lc = sf.getLineAndCharacterOfPosition(pos);
  return { line: lc.line + 1, col: lc.character + 1 };
}

function report(sf, start, text) {
  const { line, col } = getLineCol(sf, start);
  console.log(`${sf.fileName}:${line}:${col}  JSXText under <View>: ${JSON.stringify(text)}`);
}

let count = 0;
for (const file of walk(TARGET)) {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node) {
    // <View>...</View>
    if (ts.isJsxElement(node) && isTagName(node.openingElement.tagName, "View")) {
      for (const ch of node.children) {
        if (ts.isJsxText(ch)) {
          const raw = ch.getText(sf);
          const cleaned = raw.replace(/\s+/g, " ").trim();
          if (cleaned.length > 0) {
            count++;
            report(sf, ch.getStart(sf), cleaned);
          }
        }
        if (ts.isJsxExpression(ch) && ch.expression) {
          // Common crash: <View>{t("...")}</View> (strings must be inside <Text>)
          if (isTCall(ch.expression)) {
            count++;
            report(sf, ch.getStart(sf), "{t(...)}");
          } else if (isStringyExpression(ch.expression)) {
            const raw = ch.expression.getText(sf);
            const cleaned = raw.replace(/\s+/g, " ").trim();
            if (cleaned.length > 0) {
              count++;
              report(sf, ch.getStart(sf), `{${cleaned}}`);
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

if (count === 0) {
  console.log("No raw JSXText children found under <View>.");
} else {
  console.log(`\nFound ${count} issue(s). Wrap these strings in <Text> or remove them.`);
}

