import { readFileSync, writeFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('../manifest.json'));
const pluginPackage = JSON.parse(readFileSync('../package.json'));

const [major, minor, patch] = manifest.version.split('.').map(item => Number(item));
manifest.version = [major, minor, patch + 1].join('');
pluginPackage.version = [major, minor, patch + 1].join('');

writeFileSync('../manifest.json', JSON.stringify(manifest), { encoding: 'utf-8' });
writeFileSync('../package.json', JSON.stringify(pluginPackage), { encoding: 'utf-8' });
