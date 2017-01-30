const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// get library path
const lib = path.resolve(__dirname, '../packages/');
fs.readdirSync(lib)
.forEach((dirPath)=> {
  const modPath = path.join(lib, dirPath);
  // ensure path has package.json
  if (!fs.existsSync(path.join(modPath, 'package.json'))) {
    return;
  }

  // install folder
  cp.spawn('npm', ['i'], {
    env: process.env,
    cwd: modPath,
    stdio: 'inherit',
  });
});
