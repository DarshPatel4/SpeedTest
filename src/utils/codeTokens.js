import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";

function walk(node, out, parentType = "plain") {
  if (typeof node === "string") {
    for (const ch of node) out.push({ ch, type: parentType });
  } else if (Array.isArray(node)) {
    for (const n of node) walk(n, out, parentType);
  } else if (node && typeof node === "object") {
    const t = node.type || parentType;
    if (typeof node.content === "string") {
      for (const ch of node.content) out.push({ ch, type: t });
    } else if (Array.isArray(node.content)) {
      for (const c of node.content) walk(c, out, t);
    } else if (node.content != null) {
      walk(node.content, out, t);
    }
  }
}

export function tokenizeCode(code, language) {
  const grammar = Prism.languages[language];
  if (!grammar) {
    return code.split("").map((ch) => ({ ch, type: "plain" }));
  }
  const tokens = Prism.tokenize(code, grammar);
  const out = [];
  walk(tokens, out, "plain");
  return out;
}

export function getSyntaxTypesForChars(code, language) {
  const parsed = tokenizeCode(code, language);
  const types = [];
  for (let i = 0; i < code.length; i++) {
    types[i] = parsed[i]?.type ?? "plain";
  }
  return types;
}

export function syntaxClass(type) {
  switch (type) {
    case "keyword":
    case "boolean":
    case "constant":
      return "text-violet-300";
    case "string":
    case "char":
    case "attr-value":
      return "text-emerald-300";
    case "function":
    case "maybe-class-name":
      return "text-sky-300";
    case "number":
    case "property":
      return "text-amber-300";
    case "comment":
    case "prolog":
    case "doctype":
      return "text-mist-500 italic";
    case "operator":
    case "punctuation":
    case "tag":
    case "attr-name":
      return "text-slate-300";
    case "class-name":
    case "builtin":
      return "text-cyan-300";
    default:
      return "text-mist-200";
  }
}
