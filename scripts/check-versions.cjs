const fs = require('fs');
const path = require('path');
const lockPath = path.resolve(__dirname, '..', 'package-lock.json');
const content = fs.readFileSync(lockPath, 'utf8');
const json = JSON.parse(content);
const packages = json.packages || {};
const invalid = [];
const semverRe = /^\d+\.\d+\.\d+(?:[-+].*)?$/;
for (const [pkgPath, info] of Object.entries(packages)) {
  if (!info || typeof info.version !== 'string') {
    invalid.push({pkgPath, version: info && info.version});
    continue;
  }
  const v = info.version.trim();
  if (!semverRe.test(v)) {
    invalid.push({pkgPath, version: v});
  }
}
if (invalid.length === 0) {
  console.log('No suspicious versions found (basic semver check).');
  process.exit(0);
}
console.log('Suspicious version entries (non-semver-like):');
invalid.forEach(x => console.log(JSON.stringify(x)));
process.exit(2);
