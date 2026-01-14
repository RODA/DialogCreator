#!/usr/bin/env node
const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const { transformManualMarkdown } = require('./transform-markdown');

async function renderPage({ input, output, title }, repoRoot, outputDir, manualCss) {
  if (!fs.existsSync(input)) {
    console.error('Markdown source not found at', input);
    process.exit(1);
  }

  const md = fs.readFileSync(input, 'utf8');
  const processedMd = transformManualMarkdown(md, repoRoot);

  try {
    const result = await mdToPdf({ content: processedMd }, {
      as_html: true,
      stylesheet: [path.join(repoRoot, 'src', 'css', 'manual.css')],
    });

    if (!result || typeof result.content !== 'string') {
      console.error(`Failed to render HTML for ${path.basename(input)}.`);
      process.exit(1);
    }

    let html = result.content;

    // Drop md-to-pdf inline styles (they include highlight.js defaults that override our CSS)
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');

    // Remove any existing stylesheet links and inject our own relative link
    html = html.replace(/<link rel="stylesheet"[^>]*>/g, '');
    html = html.replace('</head>', `  <title>${title}</title>\n  <link rel="stylesheet" href="${manualCss}">\n</head>`);

    if (!/<main>/i.test(html)) {
      html = html.replace(/<body([^>]*)>/i, (match, attrs = '') => `<body${attrs}>\n<main>`);
      html = html.replace(/<\/body>/i, '</main>\n</body>');
    }

    // Remove md-to-pdf default classes that can override layout
    html = html.replace(/<main[^>]*class="[^"]*"[^>]*>/i, '<main>');

    // Fix asset paths that are relative to docs/ when the manual lives in docs/manual/
    html = html.replace(/src="docs\//g, 'src="../');

    // Inject a sidebar table of contents (HTML only) built from h2/h3 headings
    try {
      const mainOpen = html.search(/<main>/i);
      const mainClose = html.search(/<\/main>/i);
      if (mainOpen !== -1 && mainClose !== -1 && mainClose > mainOpen) {
        const startIdx = mainOpen + html.match(/<main>/i)[0].length;
        let inner = html.slice(startIdx, mainClose);

        // API page enhancement: within the "Scripting API — reference" section,
        // convert standalone inline code signatures into <h3 id="api-..."> blocks
        // so they can be deep-linked and added as ToC sub-entries.
        try {
          const secOpenRe = /<h2\b[^>]*id=\"scripting-api--reference\"[^>]*>[^<]*<\/h2>/i;
          const secOpenMatch = inner.match(secOpenRe);
          if (secOpenMatch) {
            const secStart = inner.indexOf(secOpenMatch[0]) + secOpenMatch[0].length;
            const nextH2Rel = inner.slice(secStart).search(/<h2\b/i);
            const secEnd = nextH2Rel === -1 ? inner.length : secStart + nextH2Rel;
            const before = inner.slice(0, secStart);
            const sectionBody = inner.slice(secStart, secEnd);
            const after = inner.slice(secEnd);

            const transformed = sectionBody.replace(/<p>([\s\S]*?)<\/p>/g, (pm, body) => {
              const codeMatches = Array.from(body.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/gi));
              if (!codeMatches.length) return pm;
              const names = [];
              for (const cm of codeMatches) {
                const codeInner = cm[1];
                const nm = codeInner.match(/<span\b[^>]*class=\"hljs-title\s+function_\"[^>]*>([^<]+)<\/span>\s*\(/i);
                if (nm && nm[1]) names.push(nm[1].trim());
              }
              if (!names.length) return pm;
              const id = 'api-' + names.join('-').toLowerCase();
              return `<h3 id="${id}">${body}</h3>`;
            });

            inner = before + transformed + after;
            // Sync the modified inner content back into the html before we proceed
            html = html.slice(0, startIdx) + inner + html.slice(mainClose);
          }
        } catch (_ignore) { /* ignore */ }

        // Collect h2/h3 in order
        const headingRe = /<(h2|h3)\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi;
        /** @type {{level: 2|3, id: string, title: string}[]} */
        const headings = [];
        let m;
        while ((m = headingRe.exec(inner)) !== null) {
          const level = m[1] === 'h2' ? 2 : 3;
          const id = m[2];
          const raw = m[3]
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          if (id && raw) {
            headings.push({ level: /** @type {2|3} */(level), id, title: raw });
          }
        }

        if (headings.length) {
          // Build nested list: h2 items containing any subsequent h3 items
          /** @type {{id:string,title:string,children:{id:string,title:string}[]}[]} */
          const sections = [];
          const summarizeApiTitle = (t) => {
            try {
              const names = [];
              const re = /([A-Za-z_$][\w$]*)\s*\(/g;
              let mm;
              while ((mm = re.exec(t)) !== null) names.push(mm[1]);
              if (names.length) return names.join(' / ');
            } catch (_e) {}
            return t;
          };
          for (const h of headings) {
            if (h.level === 2) {
              sections.push({ id: h.id, title: h.title, children: [] });
            } else if (sections.length) {
              const isApi = /^api-/.test(h.id);
              const label = isApi ? summarizeApiTitle(h.title) : h.title;
              sections[sections.length - 1].children.push({ id: h.id, title: label });
            }
          }

          const escapeHtml = (s) => String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

          const tocItems = sections.map(sec => {
            const children = sec.children
              .map(ch => `<li><a href="#${escapeHtml(ch.id)}">${escapeHtml(ch.title)}</a></li>`)
              .join('');
            const hasChildren = !!children;
            const nested = hasChildren ? `<ul class="toc-sub">${children}</ul>` : '';
            const toggle = hasChildren ? `<button class="toc-toggle" aria-label="Toggle section" aria-expanded="true"></button>` : '';
            const liClass = hasChildren ? ' class="has-children"' : '';
            return `<li${liClass}>${toggle}<a href="#${escapeHtml(sec.id)}">${escapeHtml(sec.title)}</a>${nested}</li>`;
          }).join('');

          const tocHtml = `\n<nav class="toc-sidebar" aria-label="Table of contents">\n  <div class="toc-heading">Contents</div>\n  <ul class="toc-list">${tocItems}</ul>\n</nav>\n`;

          const tocMobileHtml = `\n<details class="toc-mobile">\n  <summary>Contents</summary>\n  <ul class="toc-list">${tocItems}</ul>\n</details>\n`;

          // Wrap in a grid container and insert the nav before <main>
          html = html.replace(/<main>/i, `<div class=\"page-with-toc\">\n${tocHtml}<main id=\"main\">\n${tocMobileHtml}`);
          html = html.replace(/<\/main>/i, '</main>\n</div>');

          // Behavior script: collapsible ToC, scrollspy, anchors, smooth scroll
          const behaviorScript = `\n<script>(function(){\n  const $$ = (sel, root) => Array.from((root||document).querySelectorAll(sel));\n  // Collapsible sidebar sections\n  $$('.toc-sidebar .toc-toggle').forEach(btn=>{\n    btn.addEventListener('click', function(e){\n      e.preventDefault();\n      const li = btn.closest('li');\n      const expanded = btn.getAttribute('aria-expanded') === 'true';\n      btn.setAttribute('aria-expanded', String(!expanded));\n      if(li) li.classList.toggle('collapsed', expanded);\n    });\n  });\n  // Smooth scrolling and close mobile on click\n  function handleToCClick(e){\n    const a = e.target.closest('a[href^="#"]');\n    if(!a) return;\n    const id = decodeURIComponent(a.getAttribute('href').slice(1));\n    const target = document.getElementById(id);\n    if(target){\n      e.preventDefault();\n      target.scrollIntoView({behavior:'smooth', block:'start'});\n      const det = a.closest('details.toc-mobile');\n      if(det) det.open = false;\n      history.replaceState(null, '', '#'+id);\n    }\n  }\n  const sidebar = document.querySelector('.toc-sidebar');\n  if(sidebar) sidebar.addEventListener('click', handleToCClick, {passive:false});\n  $$('.toc-mobile').forEach(det=> det.addEventListener('click', handleToCClick, {passive:false}));\n  // Heading anchor links\n  const main = document.getElementById('main') || document.querySelector('main');\n  if(main){\n    $$('#main h2[id], #main h3[id]').forEach(h=>{\n      if(!h.querySelector('.heading-anchor')){\n        const a = document.createElement('a');\n        a.className = 'heading-anchor';\n        a.href = '#'+h.id;\n        a.setAttribute('aria-label','Link to this section');\n        a.textContent = '#';\n        h.appendChild(a);\n      }\n    });\n  }\n  // Scrollspy\n  const headings = main ? $$('#main h2[id], #main h3[id]') : [];\n  const linkMap = new Map();\n  function registerLinks(root){\n    $$('a[href^="#"]', root).forEach(a=>{\n      const id = decodeURIComponent(a.getAttribute('href').slice(1));\n      if(!id) return;\n      if(!linkMap.has(id)) linkMap.set(id, []);\n      linkMap.get(id).push(a);\n    });\n  }\n  if(sidebar) registerLinks(sidebar);\n  $$('.toc-mobile').forEach(det=> registerLinks(det));\n  function setActive(id){\n    linkMap.forEach(links => links.forEach(l => l.classList.remove('active')));\n    (linkMap.get(id)||[]).forEach(l => l.classList.add('active'));\n  }\n  function onScroll(){\n    const fromTop = window.scrollY + 120;\n    let currentId = null;\n    for(const h of headings){\n      if(h.offsetTop <= fromTop) currentId = h.id; else break;\n    }\n    if(currentId) setActive(currentId);\n  }\n  document.addEventListener('scroll', onScroll, {passive:true});\n  window.addEventListener('load', onScroll, {once:true});\n  onScroll();\n})();</script>\n`;
          html = html.replace(/<\/body>/i, behaviorScript + '\n</body>');
        }
      }
    } catch (_e) {
      // If ToC injection fails for any reason, continue without it.
    }

    html = html.replace(
      /src="\.\.\/images\//g,
      'src="./images/'
  );

  // Also fix any other relative image paths that might be problematic
  html = html.replace(
      /src="docs\/images\//g,
      'src="./images/'
  );

    fs.writeFileSync(output, html, 'utf8');
    console.log(`Manual HTML generated at: ${output}`);
  } catch (err) {
    console.error(`Error generating HTML for ${path.basename(input)}:`, (err && err.stack) || err);
    process.exit(1);
  }
}

(async function main() {
  const repoRoot = path.resolve(__dirname, '../..');
  const outputDir = path.join(repoRoot, 'docs');
  const manualCssSource = path.join(repoRoot, 'src', 'css', 'manual.css');
  const manualCssTarget = path.join(outputDir, 'css', 'manual.css');
  if (!fs.existsSync(path.dirname(manualCssTarget))) {
    fs.mkdirSync(path.dirname(manualCssTarget), { recursive: true });
  }
  try {
    fs.copyFileSync(manualCssSource, manualCssTarget);
  } catch (err) {
    console.error('Failed to sync manual.css into docs:', err && err.message ? err.message : err);
    process.exit(1);
  }
  const manualCss = path.relative(outputDir, manualCssTarget);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pages = [
    {
      input: path.join(repoRoot, 'DialogCreator.md'),
      output: path.join(outputDir, 'manual.html'),
      title: 'Dialog Creator — User Manual'
    },
    {
      input: path.join(repoRoot, 'API.md'),
      output: path.join(outputDir, 'api.html'),
      title: 'Dialog Creator — API Reference'
    }
  ];

  for (const page of pages) {
    await renderPage(page, repoRoot, outputDir, manualCss);
  }
})();
