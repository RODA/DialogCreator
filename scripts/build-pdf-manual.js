#!/usr/bin/env node
const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

(async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const input = path.join(repoRoot, 'USER_MANUAL.md');
  const outputDir = path.join(repoRoot, 'build');
  const output = path.join(outputDir, 'USER_MANUAL.pdf');

  if (!fs.existsSync(input)) {
    console.error('USER_MANUAL.md not found at', input);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function loadKnownApiFunctions(repoRoot) {
    const srcPath = path.join(repoRoot, 'src', 'library', 'api.ts');
    const defaults = new Set([]);
    try {
      if (!fs.existsSync(srcPath)) return defaults;
      const text = fs.readFileSync(srcPath, 'utf8');
      // Match API_NAMES assignment and capture array literal inside Object.freeze([...])
      const m = text.match(/export\s+const\s+API_NAMES[^=]*=\s*Object\.freeze\(\s*\[([\s\S]*?)\]\s*\)/);
      const arrBody = m ? m[1] : null;
      if (!arrBody) return defaults;
      const names = new Set();
      const re = /['"]([A-Za-z_$][\w$]*)['"]/g;
      let mm;
      while ((mm = re.exec(arrBody)) !== null) {
        names.add(mm[1]);
      }
      return names.size ? names : defaults;
    } catch (e) {
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
        buf += ch; esc = false;
        continue;
      }

      if (ch === '\\') {
        buf += ch; esc = true;
        continue;
      }

      if (!inD && ch === '\'') {
        inS = !inS; buf += ch;
        continue;
      }

      if (!inS && ch === '"') {
        inD = !inD; buf += ch;
        continue;
      }

      if (!inS && !inD) {
        if (ch === '(') {
          depth++; buf += ch;
          continue;
        }

        if (ch === ')') {
          depth = Math.max(0, depth - 1); buf += ch;
          continue;
        }

        if (ch === ',' && depth === 0) {
          args.push(buf.trim()); buf = '';
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

  function wrapToken(tok) {
    const t = tok.trim();
    if (!t) return '';
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

    return `<span class="api-param">${escapeHTML(t)}</span>`;
  }

  const KNOWN_API_FUNCS = loadKnownApiFunctions(repoRoot);

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

    let out = escapeHTML(raw)
      .replace(/(^|\b)(true|false|null|undefined)(?=\b|$)/gi, (_s, p1, kw) => `${p1}<span class=\"hljs-keyword\">${kw}</span>`)
      .replace(/(^|\D)([+-]?\d+(?:\.\d+)?)(?=\D|$)/g, (_s, p1, num) => `${p1}<span class=\"hljs-number\">${num}</span>`);
    return out;
  }

  let md = fs.readFileSync(input, 'utf8');

  // Helper utils for code-block processing
  const isIdentStart = (ch) => /[A-Za-z_$]/.test(ch);
  const isIdentPart = (ch) => /[A-Za-z0-9_$]/.test(ch);

  function findMatchingParen(str, openIdx) {
    let depth = 0;
    let inS = false, inD = false, esc = false;
    for (let i = openIdx; i < str.length; i++) {
      const ch = str[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (!inD && ch === '\'') { inS = !inS; continue; }
      if (!inS && ch === '"') { inD = !inD; continue; }
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
    let inS = false, inD = false, esc = false;
    const controlKeywords = new Set(['if','for','while','switch','catch','with','return','else','do','try','finally']);
    while (i < line.length) {
      const ch = line[i];
      // Strings
      if (!inD && ch === '\'' && !esc) {
        const start = i;
        i++;
        let sEsc = false;
        while (i < line.length) {
          const c = line[i];
          if (sEsc) { sEsc = false; i++; continue; }
          if (c === '\\') { sEsc = true; i++; continue; }
          if (c === '\'') { i++; break; }
          i++;
        }
        out += `<span class="hljs-string">${escapeHTML(line.slice(start, i))}</span>`;
        esc = false;
        continue;
      }
      if (!inS && ch === '"' && !esc) {
        const start = i;
        i++;
        let sEsc = false;
        while (i < line.length) {
          const c = line[i];
          if (sEsc) { sEsc = false; i++; continue; }
          if (c === '\\') { sEsc = true; i++; continue; }
          if (c === '"') { i++; break; }
          i++;
        }
        out += `<span class="hljs-string">${escapeHTML(line.slice(start, i))}</span>`;
        esc = false;
        continue;
      }

      // Line comments
      if (ch === '/' && line[i + 1] === '/') {
        out += `<span class="hljs-comment">${escapeHTML(line.slice(i))}</span>`;
        break;
      }

      // Numbers
      if ((ch === '+' || ch === '-' || /\d/.test(ch)) && (i === 0 || !isIdentPart(line[i - 1]))) {
        const start = i;
        if (ch === '+' || ch === '-') i++;
        let sawDigit = false;
        while (i < line.length && /\d/.test(line[i])) { i++; sawDigit = true; }
        if (i < line.length && line[i] === '.' ) {
          i++;
          while (i < line.length && /\d/.test(line[i])) { i++; sawDigit = true; }
        }
        if (sawDigit) {
          out += `<span class="hljs-number">${escapeHTML(line.slice(start, i))}</span>`;
          continue;
        } else {
          // not a number actually, fall through and treat char-by-char
          i = start;
        }
      }

      // Identifiers and function calls
      if (isIdentStart(ch)) {
        const idStart = i;
        // Parse dotted path like ui.show
        while (i < line.length) {
          // consume identifier
          if (!isIdentStart(line[i])) break;
          i++;
          while (i < line.length && isIdentPart(line[i])) i++;
          if (line[i] === '.' && isIdentStart(line[i + 1])) { i++; continue; }
          break;
        }
        const ident = line.slice(idStart, i);
        // Skip spaces but preserve them
        let k = i; while (k < line.length && /\s/.test(line[k])) k++;
        const spaceAfter = line.slice(i, k);
        // Keywords (control flow, etc.)
        if (controlKeywords.has(ident)) {
          out += `<span class=\"hljs-keyword\">${ident}</span>` + escapeHTML(spaceAfter);
          i = k; // continue parsing from after the preserved spaces
          continue;
        }
        if (line[k] === '(') {
          const closeIdx = findMatchingParen(line, k);
          if (closeIdx !== -1) {
            const argsStr = line.slice(k + 1, closeIdx);
            // Namespace and function name
            const parts = ident.split('.');
            const fn = parts[parts.length - 1];
            const ns = parts.length > 1 ? `${escapeHTML(parts.slice(0, -1).join('.'))}.` : '';
            // Style top-level args; if nested calls are present, processLine on those parts
            const styledArgs = splitTopLevelArgs(argsStr).map(a => {
              const hasCall = /[A-Za-z_$][\w$]*\s*\(/.test(a);
              if (hasCall) return processLine(a);
              return wrapToken(a);
            }).join(', ');
            out += `${ns}<span class=\"hljs-title function_\">${escapeHTML(fn)}</span>(${styledArgs})`;
            i = closeIdx + 1;
            continue;
          }
        }
        // Not a function call; style booleans if they appear standalone
        if (/^(?:true|false|null|undefined)$/.test(ident)) {
          out += `<span class=\"hljs-keyword\">${ident}</span>`;
        } else {
          out += escapeHTML(ident);
        }
        // Preserve any spaces we skipped
        out += escapeHTML(spaceAfter);
        continue;
      }

      // Default: copy char
      out += escapeHTML(ch);
      i++;
    }
    return out;
  }

  function transformCodeBlock(code) {
    const lines = code.replace(/\r\n?/g, '\n').split('\n');
    return lines.map(processLine).join('\n');
  }

  // Transform fenced JavaScript code blocks into styled HTML <pre><code> blocks FIRST
  md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, body) => {
    const l = (lang || '').toLowerCase();
    if (l && !/^(js|javascript)$/.test(l)) return m; // leave non-JS blocks untouched
    const transformed = transformCodeBlock(body);
    return `<pre><code class=\"language-javascript hljs\">${transformed}</code></pre>`;
  });

  // Then replace inline backtick code with styled HTML; do not span across newlines
  md = md.replace(/`([^`\n]+)`/g, (_m, inner) => `<code class=\"hljs\">${styleInlineCode(inner)}</code>`);

  try {
    const result = await mdToPdf({ content: md }, {
      dest: output,
      pdf_options: {
        format: 'A4',
        margin: { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true
      },
  stylesheet: [ path.join(repoRoot, 'src', 'css', 'pdf.css') ]
    });

    if (fs.existsSync(output) || (result && result.pdf)) {
      console.log('Manual PDF generated at:', output);
      process.exit(0);
    }

    console.error('Failed to generate PDF: no output produced.');
    process.exit(1);

  } catch (err) {
    console.error('Error generating PDF:', (err && err.stack) || err);
    process.exit(1);
  }
})();
