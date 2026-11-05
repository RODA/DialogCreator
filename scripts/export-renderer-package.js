// Publishable, self-contained renderer artifact. Consumers never import a sibling checkout.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'build/renderer-package');
const metadata = require('../src/renderer/package.json');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const result = esbuild.buildSync({
    entryPoints: [path.join(root, 'src/renderer/index.ts')],
    outfile: path.join(output, 'renderer.js'),
    bundle: true,
    platform: 'browser',
    format: 'cjs',
    target: 'es2022',
    metafile: true
});
esbuild.buildSync({
    entryPoints: [path.join(root, 'src/renderer/core.ts')],
    outfile: path.join(output, 'core.js'),
    bundle: true, platform: 'neutral', format: 'cjs', target: 'es2022'
});
execFileSync(path.join(root, 'node_modules/.bin/tsc'), [
    '--ignoreConfig', 'src/renderer/index.ts', 'src/renderer/core.ts', 'src/interfaces/global.d.ts', 'src/types/sortablejs.d.ts', '--declaration', '--emitDeclarationOnly',
    '--strict', '--skipLibCheck', '--target', 'es2022', '--module', 'commonjs',
    '--rootDir', 'src', '--outDir', path.join(output, 'types')
], { cwd: root, stdio: 'inherit' });
fs.mkdirSync(path.join(output, 'css'));
for (const name of ['global.css', 'editor.css', 'preview.css']) {
    fs.copyFileSync(path.join(root, 'src/css', name), path.join(output, 'css', name));
}
fs.cpSync(path.join(root, 'src/assets'), path.join(output, 'assets'), { recursive: true });
const inputs = [...Object.keys(result.metafile.inputs)].sort();
const sources = Object.fromEntries(inputs.filter((name) => !name.includes('node_modules/')).map((name) => [
    path.relative(root, path.resolve(root, name)),
    crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root, name))).digest('hex')
]));
const addAssetSources = function(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            addAssetSources(filename);
        } else {
            sources[path.relative(root, filename)] = crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
        }
    }
};
addAssetSources(path.join(root, 'src/assets'));
for (const name of ['global.css', 'editor.css', 'preview.css']) {
    const filename = 'src/css/' + name;
    sources[filename] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, filename))).digest('hex');
}
fs.writeFileSync(path.join(output, 'provenance.json'), JSON.stringify({
    owner: 'DialogCreator', version: metadata.version, sources
}, null, 4) + '\n');
fs.writeFileSync(path.join(output, 'core.d.ts'), "export * from './types/renderer/core';\n");
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(output, 'LICENSE'));
fs.writeFileSync(path.join(output, 'package.json'), JSON.stringify({
    ...metadata,
    private: false,
    main: 'renderer.js',
    types: 'types/renderer/index.d.ts',
    license: 'SEE LICENSE IN LICENSE'
}, null, 4) + '\n');
const destination = path.resolve(process.argv[2] || path.join(root, 'build'));
fs.mkdirSync(destination, { recursive: true });
execFileSync('npm', ['pack', output, '--pack-destination', destination, '--ignore-scripts'], {
    cwd: root, stdio: 'inherit'
});
