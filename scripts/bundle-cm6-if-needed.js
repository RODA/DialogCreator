/*
    Conditionally rebuild the CodeMirror bundle only when the entry file changed
*/
const fs = require('fs');
const path = require('path');

const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const entry = path.join(repoRoot, 'src', 'library', 'codemirror-entry.ts');
const outdir = path.join(repoRoot, 'src', 'bundles');
const outfile = path.join(outdir, 'codemirror.bundle.js');
const dependentSources = [
    entry,
    path.join(repoRoot, 'src', 'library', 'api.ts'),
    path.join(repoRoot, 'src', 'interfaces', 'preview.ts')
];

async function main() {
    try {
        const needsBuild = (() => {
            if (!fs.existsSync(outfile)) {
                return true;
            }

            try {
                const bundleStat = fs.statSync(outfile);
                let newestSourceMtime = 0;

                for (const file of dependentSources) {
                    if (!fs.existsSync(file)) continue;
                    const stat = fs.statSync(file);
                    if (stat.mtimeMs > newestSourceMtime) {
                        newestSourceMtime = stat.mtimeMs;
                    }
                }

                return newestSourceMtime > bundleStat.mtimeMs;
            } catch {
                return true;
            }
        })();

        if (!needsBuild) {
            console.log('[bundle:cm6] up to date:', path.relative(repoRoot, outfile));
            return;
        }

        if (!fs.existsSync(outdir)) {
            fs.mkdirSync(outdir, { recursive: true });
        }

        console.log('[bundle:cm6] building...');

        await esbuild.build({
            entryPoints: [entry],
            outfile,
            bundle: true,
            format: 'iife',
            platform: 'browser',
            target: ['es2020'],
            // Prevent pulling Node/Electron built-ins into the browser bundle
            external: ['electron', 'fs', 'path', 'events']
        });

        console.log('[bundle:cm6] done:', path.relative(repoRoot, outfile));

    } catch (err) {
        console.error('[bundle:cm6] failed:', err && err.message ? err.message : err);
        process.exitCode = 1;
    }
}

main();
