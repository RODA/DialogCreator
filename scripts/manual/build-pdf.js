#!/usr/bin/env node
const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const { transformManualMarkdown } = require('./transform-markdown');

async function renderPdf({ inputs, output }, repoRoot) {
  const sources = (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean);

  if (!sources.length) {
    console.error('No markdown sources provided');
    process.exit(1);
  }

  const missing = sources.filter((src) => !fs.existsSync(src));
  if (missing.length) {
    missing.forEach((src) => console.error('Markdown source not found at', src));
    process.exit(1);
  }

  const PAGE_BREAK = '\n\n<div class="page-break"></div>\n\n';
  const raw = sources
    .map((src) => fs.readFileSync(src, 'utf8'))
    .join(PAGE_BREAK);

  const md = transformManualMarkdown(raw, repoRoot);

  try {
    const result = await mdToPdf({ content: md }, {
      dest: output,
      pdf_options: {
        format: 'A4',
        margin: { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' },
        printBackground: true,
      },
      stylesheet: [path.join(repoRoot, 'src', 'css', 'pdf.css')],
    });

    if (fs.existsSync(output) || (result && result.pdf)) {
      console.log('Manual PDF generated at:', output);
      return;
    }

    console.error('Failed to generate PDF: no output produced for', sources.join(', '));
    process.exit(1);

  } catch (err) {
    console.error('Error generating PDF from sources:', sources.map((src) => path.basename(src)).join(', '));
    console.error((err && err.stack) || err);
    process.exit(1);
  }
}

(async function main() {
  const repoRoot = path.resolve(__dirname, '../..');
  const outputDir = path.join(repoRoot, 'docs');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await renderPdf({
    inputs: [
      path.join(repoRoot, 'DialogCreator.md'),
      path.join(repoRoot, 'API.md'),
    ],
    output: path.join(outputDir, 'DialogCreator.pdf'),
  }, repoRoot);
})();
