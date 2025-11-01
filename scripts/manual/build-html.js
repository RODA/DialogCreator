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
      stylesheet: [path.join(repoRoot, 'docs', 'manual', 'css', 'manual.css')],
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

    fs.writeFileSync(output, html, 'utf8');
    console.log(`Manual HTML generated at: ${output}`);
  } catch (err) {
    console.error(`Error generating HTML for ${path.basename(input)}:`, (err && err.stack) || err);
    process.exit(1);
  }
}

(async function main() {
  const repoRoot = path.resolve(__dirname, '../..');
  const outputDir = path.join(repoRoot, 'docs', 'manual');
  const manualCss = path.relative(outputDir, path.join(repoRoot, 'docs', 'manual', 'css', 'manual.css'));

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pages = [
    {
      input: path.join(repoRoot, 'DialogCreator.md'),
      output: path.join(outputDir, 'index.html'),
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
