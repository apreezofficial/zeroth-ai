export type TokenKind = "kw" | "str" | "com" | "num" | "fn" | "pun" | "txt";
export interface Token {
  kind: TokenKind;
  text: string;
}

const JS_KW = "import|export|from|const|let|var|function|return|await|async|for|of|in|if|else|new|class|extends|type|interface|true|false|null|undefined|throw|try|catch|default|as|typeof";
const SWIFT_KW = "import|let|var|func|try|await|async|for|in|if|else|return|true|false|nil|struct|class|enum|case|throws|guard|self";
const KOTLIN_KW = "import|val|var|fun|suspend|for|in|if|else|return|true|false|null|class|object|when|is|as";
const SH_KW = "npm|npx|node|git|cd|cp|export|echo";

const LANGS: Record<string, { kw: string; line: string; block?: boolean }> = {
  ts: { kw: JS_KW, line: "//", block: true },
  js: { kw: JS_KW, line: "//", block: true },
  swift: { kw: SWIFT_KW, line: "//", block: true },
  kotlin: { kw: KOTLIN_KW, line: "//", block: true },
  bash: { kw: SH_KW, line: "#" },
  json: { kw: "true|false|null", line: "\u0000" },
};

/** Maps a file name or language hint to a highlighter language. */
export function detectLang(fileOrLang = ""): string {
  const f = fileOrLang.toLowerCase();
  if (f in LANGS) return f;
  if (/\.(tsx?|mjs|cjs|jsx?)$/.test(f)) return "ts";
  if (f.endsWith(".swift")) return "swift";
  if (f.endsWith(".kt") || f.endsWith(".kts")) return "kotlin";
  if (f.endsWith(".json")) return "json";
  if (f === "terminal" || f.endsWith(".sh") || f === "shell") return "bash";
  return "txt";
}

/** A small, dependency-free tokenizer: good enough for docs snippets. */
export function highlight(code: string, lang: string): Token[] {
  const cfg = LANGS[lang];
  if (!cfg) return [{ kind: "txt", text: code }];

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const parts = [
    `(?<com>${esc(cfg.line)}[^\\n]*${cfg.block ? "|/\\*[\\s\\S]*?\\*/" : ""})`,
    `(?<str>"(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\`)`,
    `(?<num>\\b\\d[\\d_.]*\\b)`,
    `(?<kw>\\b(?:${cfg.kw})\\b)`,
    `(?<fn>\\b[A-Za-z_$][\\w$]*(?=\\())`,
  ];
  const re = new RegExp(parts.join("|"), "g");

  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ kind: "txt", text: code.slice(last, idx) });
    const g = m.groups ?? {};
    const kind = (g.com ? "com" : g.str ? "str" : g.num ? "num" : g.kw ? "kw" : "fn") as TokenKind;
    out.push({ kind, text: m[0] });
    last = idx + m[0].length;
  }
  if (last < code.length) out.push({ kind: "txt", text: code.slice(last) });
  return out;
}

export const tokenClass: Record<TokenKind, string> = {
  kw: "text-[#c4b0ff]",
  str: "text-[#7ee8c8]",
  com: "text-[#7c7c92] italic",
  num: "text-[#ffbe7b]",
  fn: "text-[#8ccbff]",
  pun: "",
  txt: "",
};
