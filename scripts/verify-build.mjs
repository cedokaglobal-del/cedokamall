/**
 * Post-build guard.
 *
 * Fails the build if any emitted chunk references a React hook as a bare global
 * (e.g. `useCallback(...)` instead of `React.useCallback(...)`).
 *
 * That pattern means the source used a hook without importing it, so the minifier
 * leaves it as an undefined global and the page throws
 * "useCallback is not defined" at runtime. It is a build-time defect that only
 * shows up in the browser, so we assert on the built output instead.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const JS_DIR = join(process.cwd(), 'dist', 'assets', 'js');

const HOOKS = [
  'useCallback',
  'useMemo',
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useReducer',
  'useContext',
  'useId',
  'useRef',
  'useSyncExternalStore',
  'useImperativeHandle',
  'useDebugValue',
  'useTransition',
  'useDeferredValue',
];

const walk = (dir) => {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (extname(full) === '.js') out.push(full);
  }
  return out;
};

const files = walk(JS_DIR);

if (files.length === 0) {
  console.error('[verify-build] No built chunks found in dist/assets/js - did the build run?');
  process.exit(1);
}

const findings = [];

for (const file of files) {
  const code = readFileSync(file, 'utf8');
  for (const hook of HOOKS) {
    // Negative lookbehind rejects `.useCallback` (valid property access) and
    // identifiers that merely end with the hook name (e.g. `myUseCallback`).
    const pattern = new RegExp(`(?<![.\\w$])${hook}\\s*\\(`, 'g');
    const matches = code.match(pattern);
    if (matches) {
      findings.push({ file, hook, count: matches.length });
    }
  }
}

if (findings.length > 0) {
  console.error('[verify-build] FAILED: bare React hook reference(s) found in built output.');
  for (const f of findings) {
    console.error(`  - ${f.file}: ${f.hook} referenced ${f.count}x without a React import`);
  }
  console.error('[verify-build] This ships a runtime "X is not defined" crash. Add the missing import and rebuild.');
  process.exit(1);
}

console.log(`[verify-build] OK: ${files.length} chunks scanned, no bare React hook references.`);
