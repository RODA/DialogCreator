#!/usr/bin/env node
const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

(async () => {
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

  try {
    const result = await mdToPdf({ path: input }, {
      dest: output,
      pdf_options: {
        format: 'A4',
        margin: {
          top: '15mm', right: '15mm', bottom: '20mm', left: '15mm'
        },
        printBackground: true
      },
      // Basic styles to improve PDF readability
      stylesheet: [
        path.join(repoRoot, 'src', 'css', 'pdf-styles.css')
      ]
    });

    // Some versions return a Buffer at result.pdf only when no dest is provided.
    // Prefer file existence when a dest is set.
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
