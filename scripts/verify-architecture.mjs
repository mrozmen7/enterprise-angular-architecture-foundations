import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const featureRoot = join(root, 'src', 'app', 'features', 'projects');
const violations = [];

const productionFiles = collectFiles(featureRoot).filter(
  (file) => extname(file) === '.ts' && !file.endsWith('.spec.ts'),
);

for (const file of productionFiles) {
  const source = readFileSync(file, 'utf8');
  const layer = getLayer(file);
  const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);

  for (const importPath of imports) {
    enforceLayerRules(file, layer, importPath);
  }

  if (source.includes('.subscribe(')) {
    violations.push(
      `${display(file)} owns a manual subscription. Prefer toSignal, the async pipe, or an explicitly documented lifecycle boundary.`,
    );
  }
}

const testFiles = collectFiles(join(root, 'src')).filter((file) => file.endsWith('.spec.ts'));

for (const file of testFiles) {
  const source = readFileSync(file, 'utf8');

  if (/\b(?:describe|it|test)\.only\s*\(/.test(source)) {
    violations.push(`${display(file)} contains a focused test (.only).`);
  }

  if (/\b(?:describe|it|test)\.skip\s*\(/.test(source)) {
    violations.push(`${display(file)} contains a skipped test (.skip).`);
  }
}

if (violations.length > 0) {
  console.error('Architecture verification failed:\n');

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    `Architecture verification passed for ${productionFiles.length} production files and ${testFiles.length} test files.`,
  );
}

function enforceLayerRules(file, layer, importPath) {
  const forbiddenByLayer = {
    domain: ['application', 'infrastructure', 'ports', 'presentation', 'data'],
    ports: ['application', 'infrastructure', 'presentation', 'data'],
    application: ['infrastructure', 'presentation', 'data'],
    presentation: ['infrastructure', 'data'],
    infrastructure: ['application', 'presentation'],
  };

  if (layer && importPath.startsWith('.')) {
    const target = resolve(join(file, '..'), importPath);
    const targetLayer = getLayer(target);

    if (targetLayer && forbiddenByLayer[layer]?.includes(targetLayer)) {
      violations.push(
        `${display(file)} (${layer}) must not depend on the ${targetLayer} layer via "${importPath}".`,
      );
    }
  }

  if (
    importPath.startsWith('@angular/common/http') &&
    layer !== 'infrastructure' &&
    !file.endsWith(`${sep}app.config.ts`)
  ) {
    violations.push(
      `${display(file)} imports Angular HTTP outside the infrastructure/composition boundary.`,
    );
  }
}

function getLayer(file) {
  const relativePath = relative(featureRoot, file);
  const [firstSegment] = relativePath.split(sep);
  const layers = new Set([
    'application',
    'data',
    'domain',
    'infrastructure',
    'ports',
    'presentation',
  ]);

  return layers.has(firstSegment) ? firstSegment : null;
}

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}

function display(file) {
  return relative(root, file);
}
