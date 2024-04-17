/* eslint-disable */

const replaceInFile = require('replace-in-file');
const readline = require('readline/promises');
const fs = require('fs/promises');
const { execSync } = require('child_process');

function toSlug(str) {
  return str
    .trim()
    .toLowerCase() // Convert the string to lowercase
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim(); // Trim leading and trailing whitespace
}

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const name = toSlug(await rl.question('Project name (will be slugged): '));
  const description = await rl.question('Project description: ');
  rl.close();

  await replaceInFile({
    files: './**/*',
    ignore: './node_modules/**/*',
    from: /{{ ?PROJECT_NAME ?}}/g,
    to: name,
  });

  await replaceInFile({
    files: './**/*',
    ignore: './node_modules/**/*',
    from: /{{ ?PROJECT_DESCRIPTION ?}}/g,
    to: description,
  });

  const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
  delete pkg?.scripts?.postinstall;
  delete pkg?.devDependencies?.['replace-in-file'];
  await fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
  execSync('npm i');
})();
