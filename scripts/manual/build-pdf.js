#!/usr/bin/env node
const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const { transformManualMarkdown } = require('./transform-markdown');

(async function main() {
  const repoRoot = path.resolve(__dirname, '../..');
  const input = path.join(repoRoot, 'DialogCreator.md');
  const outputDir = path.join(repoRoot, 'docs', 'manual');
  const output = path.join(outputDir, 'DialogCreator.pdf');

  if (!fs.existsSync(input)) {
    console.error('DialogCreator.md not found at', input);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const md = transformManualMarkdown(fs.readFileSync(input, 'utf8'), repoRoot);

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
      process.exit(0);
    }

    console.error('Failed to generate PDF: no output produced.');
    process.exit(1);

  } catch (err) {
    console.error('Error generating PDF:', (err && err.stack) || err);
    process.exit(1);
  }
})();
