// JSON is the source of truth; wrappers retain file:// support.
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'api');
for (const file of fs.readdirSync(dir).filter(file => file.endsWith('.json'))) {
  const name = path.basename(file, '.json');
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const wrapper = `window.ResumeAPI = window.ResumeAPI || {};\nwindow.ResumeAPI.${name} = ${JSON.stringify(data, null, 2)};\n`;
  const target = path.join(dir, name + '.js');
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== wrapper) {
      throw new Error(`${name}: run npm run sync-data`);
    }
  } else fs.writeFileSync(target, wrapper);
}
