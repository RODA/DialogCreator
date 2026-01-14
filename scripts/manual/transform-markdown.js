'use strict';

const fs = require('fs');
const path = require('path');

const cachedApiNames = new Map();

function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loadKnownApiFunctions(repoRoot) {
  const key = repoRoot || '__default__';
  if (cachedApiNames.has(key)) {
    return cachedApiNames.get(key);
  }

  const srcPath = path.join(repoRoot, 'src', 'library', 'api.ts');
  const defaults = new Set([]);
  try {
    if (!fs.existsSync(srcPath)) {
      cachedApiNames.set(key, defaults);
      return defaults;
    }
    const text = fs.readFileSync(srcPath, 'utf8');
    const match = text.match(/export\s+const\s+API_NAMES[^=]*=\s*Object\.freeze\(\s*\[([\s\S]*?)\]\s*\)/);
    const arrBody = match ? match[1] : null;
    if (!arrBody) {
      cachedApiNames.set(key, defaults);
      return defaults;
    }
    const names = new Set();
    const re = /['"]([A-Za-z_$][\w$]*)['"]/g;
    let mm;
    while ((mm = re.exec(arrBody)) !== null) {
      names.add(mm[1]);
    }
    const result = names.size ? names : defaults;
    cachedApiNames.set(key, result);
    return result;
  } catch (_err) {
    cachedApiNames.set(key, defaults);
    return defaults;
  }
}

function splitTopLevelArgs(argStr) {
  const args = [];
  let buf = '';
  let depth = 0;
  let inS = false;
  let inD = false;
  let esc = false;
  for (let i = 0; i < argStr.length; i++) {
    const ch = argStr[i];
    if (esc) {
      buf += ch;
      esc = false;
      continue;
    }

    if (ch === '\\') {
      buf += ch;
      esc = true;
      continue;
    }

    if (!inD && ch === "'") {
      inS = !inS;
      buf += ch;
      continue;
    }

    if (!inS && ch === '"') {
      inD = !inD;
      buf += ch;
      continue;
    }

    if (!inS && !inD) {
      if (ch === '(') {
        depth++;
        buf += ch;
        continue;
      }

      if (ch === ')') {
        depth = Math.max(0, depth - 1);
        buf += ch;
        continue;
      }

      if (ch === ',' && depth === 0) {
        args.push(buf.trim());
        buf = '';
        continue;
      }
    }

    buf += ch;
  }

  if (buf.trim().length) {
    args.push(buf.trim());
  }

  return args;
}

function transformManualMarkdown(md, repoRoot) {
  const KNOWN_API_FUNCS = loadKnownApiFunctions(repoRoot);

  function wrapToken(tok) {
    const t = tok.trim();
    if (!t) return '';
    const wrapMixedToken = (input) => {
      let out = '';
      let buf = '';
      let inS = false;
      let inD = false;
      let esc = false;
      const flushParam = () => {
        if (!buf.length) return;
        out += `<span class="api-param">${escapeHTML(buf)}</span>`;
        buf = '';
      };
      const flushString = () => {
        if (!buf.length) return;
        out += `<span class="hljs-string">${escapeHTML(buf)}</span>`;
        buf = '';
      };
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (esc) {
          buf += ch;
          esc = false;
          continue;
        }
        if (ch === '\\') {
          buf += ch;
          esc = true;
          continue;
        }
        if (!inD && ch === "'") {
          if (!inS) {
            flushParam();
            inS = true;
            buf += ch;
          } else {
            buf += ch;
            flushString();
            inS = false;
          }
          continue;
        }
        if (!inS && ch === '"') {
          if (!inD) {
            flushParam();
            inD = true;
            buf += ch;
          } else {
            buf += ch;
            flushString();
            inD = false;
          }
          continue;
        }
        buf += ch;
      }
      if (buf.length) {
        if (inS || inD) {
          flushString();
        } else {
          flushParam();
        }
      }
      return out;
    };
    if (
      (t.startsWith("'") && t.endsWith("'")) ||
      (t.startsWith('"') && t.endsWith('"'))
    ) {
      return `<span class="hljs-string">${escapeHTML(t)}</span>`;
    }

    if (/^[+-]?\d+(?:\.\d+)?$/.test(t)) {
      return `<span class="hljs-number">${escapeHTML(t)}</span>`;
    }

    if (/^(?:true|false|null|undefined)$/i.test(t)) {
      return `<span class="hljs-keyword">${escapeHTML(t)}</span>`;
    }

    if (/[\'"]/.test(t)) {
      return wrapMixedToken(t);
    }

    return `<span class="api-param">${escapeHTML(t)}</span>`;
  }

  function styleInlineCode(code) {
    const raw = code.trim();
    const m = raw.match(/^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\((.*)\)$/);
    if (m) {
      const dotted = m[1];
      const fn = dotted.split('.').pop();
      const argsStr = m[2];
      const styledArgs = splitTopLevelArgs(argsStr).map(wrapToken).join(', ');
      const ns = dotted.includes('.') ? `${escapeHTML(dotted.slice(0, -(fn.length + 1)))}.` : '';
      const styledFn = `<span class="hljs-title function_">${escapeHTML(fn)}</span>`;
      return `${ns}${styledFn}(${styledArgs})`;
    }

    if (/^[A-Za-z_$][\w$]*$/.test(raw)) {
      if (KNOWN_API_FUNCS.has(raw)) {
        return `<span class="hljs-title function_">${escapeHTML(raw)}</span>`;
      }
      return `<span class="api-param">${escapeHTML(raw)}</span>`;
    }

    if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
      return `<span class="hljs-string">${escapeHTML(raw)}</span>`;
    }

    return escapeHTML(raw)
      .replace(/(^|\b)(true|false|null|undefined)(?=\b|$)/gi, (_s, p1, kw) => `${p1}<span class="hljs-keyword">${kw}</span>`)
      .replace(/(^|\D)([+-]?\d+(?:\.\d+)?)(?=\D|$)/g, (_s, p1, num) => `${p1}<span class="hljs-number">${num}</span>`);
  }

  const isIdentStart = (ch) => /[A-Za-z_$]/.test(ch);
  const isIdentPart = (ch) => /[A-Za-z0-9_$]/.test(ch);

  function findMatchingParen(str, openIdx) {
    let depth = 0;
    let inS = false;
    let inD = false;
    let esc = false;
    for (let i = openIdx; i < str.length; i++) {
      const ch = str[i];
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === '\\') {
        esc = true;
        continue;
      }
      if (!inD && ch === "'") {
        inS = !inS;
        continue;
      }
      if (!inS && ch === '"') {
        inD = !inD;
        continue;
      }
      if (inS || inD) continue;
      if (ch === '(') depth++;
      if (ch === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function processLine(line) {
    let out = '';
    let i = 0;
    const controlKeywords = new Set([
      'if', 'for', 'while', 'switch', 'case', 'break', 'continue', 'default',
      'catch', 'with', 'return', 'else', 'do', 'try', 'finally', 'throw',
      'const', 'let', 'var', 'function', 'class', 'extends', 'new',
      'async', 'await', 'yield', 'typeof', 'instanceof', 'in', 'of', 'delete',
    ]);
    while (i < line.length && line[i] === ' ') {
      // Preserve leading indentation even when markdown trims list HTML blocks.
      out += '&nbsp;';
      i++;
    }
    while (i < line.length) {
      const ch = line[i];

      if (ch === '/' && line[i + 1] === '/') {
        out += `<span class="hljs-comment">${escapeHTML(line.slice(i))}</span>`;
        break;
      }

      if (ch === "'" || ch === '"') {
        const quote = ch;
        const start = i;
        i++;
        let sEsc = false;
        while (i < line.length) {
          const c = line[i];
          if (sEsc) {
            sEsc = false;
            i++;
            continue;
          }
          if (c === '\\') {
            sEsc = true;
            i++;
            continue;
          }
          if (c === quote) {
            i++;
            break;
          }
          i++;
        }
        out += `<span class="hljs-string">${escapeHTML(line.slice(start, i))}</span>`;
        continue;
      }

      if ((ch === '+' || ch === '-' || /\d/.test(ch)) && (i === 0 || !isIdentPart(line[i - 1]))) {
        const start = i;
        if (ch === '+' || ch === '-') i++;
        let sawDigit = false;
        while (i < line.length && /\d/.test(line[i])) {
          i++;
          sawDigit = true;
        }
        if (i < line.length && line[i] === '.') {
          i++;
          while (i < line.length && /\d/.test(line[i])) {
            i++;
            sawDigit = true;
          }
        }
        if (sawDigit) {
          out += `<span class="hljs-number">${escapeHTML(line.slice(start, i))}</span>`;
          continue;
        }
        i = start;
      }

      if (isIdentStart(ch)) {
        const idStart = i;
        while (i < line.length) {
          if (!isIdentStart(line[i])) break;
          i++;
          while (i < line.length && isIdentPart(line[i])) i++;
          if (line[i] === '.' && isIdentStart(line[i + 1])) {
            i++;
            continue;
          }
          break;
        }
        const ident = line.slice(idStart, i);
        let k = i;
        while (k < line.length && /\s/.test(line[k])) k++;
        const spaceAfter = line.slice(i, k);

        if (controlKeywords.has(ident)) {
          out += `<span class="hljs-keyword">${ident}</span>` + escapeHTML(spaceAfter);
          i = k;
          continue;
        }

        if (line[k] === '(') {
          const closeIdx = findMatchingParen(line, k);
          if (closeIdx !== -1) {
            const argsStr = line.slice(k + 1, closeIdx);
            const parts = ident.split('.');
            const fn = parts[parts.length - 1];
            const ns = parts.length > 1 ? `${escapeHTML(parts.slice(0, -1).join('.'))}.` : '';
            const styledArgs = splitTopLevelArgs(argsStr).map((a) => {
              const hasCall = /[A-Za-z_$][\w$]*\s*\(/.test(a);
              if (hasCall) return processLine(a);
              return wrapToken(a);
            }).join(', ');
            out += `${ns}<span class="hljs-title function_">${escapeHTML(fn)}</span>(${styledArgs})`;
            i = closeIdx + 1;
            continue;
          }

          // Highlight function names even when the call spans multiple lines.
          const parts = ident.split('.');
          const fn = parts[parts.length - 1];
          const ns = parts.length > 1 ? `${escapeHTML(parts.slice(0, -1).join('.'))}.` : '';
          out += `${ns}<span class="hljs-title function_">${escapeHTML(fn)}</span>`;
          out += escapeHTML(spaceAfter);
          i = k;
          continue;
        }

        if (/^(?:true|false|null|undefined)$/.test(ident)) {
          out += `<span class="hljs-keyword">${ident}</span>`;
        } else {
          out += `<span class="api-param">${escapeHTML(ident)}</span>`;
        }
        out += escapeHTML(spaceAfter);
        i = k;
        continue;
      }

      out += escapeHTML(ch);
      i++;
    }
    return out;
  }

  function transformCodeBlock(code) {
    const lines = code.replace(/\r\n?/g, '\n').split('\n');
    return lines.map(processLine).join('\n');
  }

let out = md;

out = out.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, body) => {
    const l = (lang || '').toLowerCase();
    if (l && !/^(js|javascript)$/.test(l)) return m;
    const transformed = transformCodeBlock(body);
    return `<pre><code class="language-javascript hljs">${transformed}</code></pre>`;
  });

  out = out.replace(/`([^`\n]+)`/g, (_m, inner) => `<code class="hljs">${styleInlineCode(inner)}</code>`);

  return out;
}

module.exports = {
  transformManualMarkdown,
};
