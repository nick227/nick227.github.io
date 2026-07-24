// Import Boundary Check Test
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../src');

// Recursively traverse directory to find JavaScript modules
function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getJsFiles(rootDir);
let hasViolations = false;

console.log(`Analyzing import boundaries for ${files.length} modules...`);

files.forEach(file => {
  const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // Root subdirectory name ('utils', 'graphics', 'runtime', etc.)
  const section = relativePath.split('/')[0];

  lines.forEach((line, lineIdx) => {
    // Find JS import statements (capturing the module target path)
    const match = line.match(/import\s+(?:.*\s+from\s+)?['"](.*)['"]/);
    if (match) {
      const importTarget = match[1];

      // Rule A: Utilities tier must be leaf nodes (only import other utilities or math)
      if (section === 'utils') {
        if (
          importTarget.includes('/services/') || 
          importTarget.includes('/runtime/') || 
          importTarget.includes('/effects/') || 
          importTarget.includes('/events/') || 
          importTarget.includes('/generators/')
        ) {
          console.error(`[VIOLATION] ${relativePath}:L${lineIdx + 1} - Utility tier must not import from higher level: "${line.trim()}"`);
          hasViolations = true;
        }
      }

      // Rule B: Graphics must be purely stateless drawing primitives
      if (section === 'graphics') {
        if (
          importTarget.includes('/services/') || 
          importTarget.includes('/runtime/') || 
          importTarget.includes('/events/')
        ) {
          console.error(`[VIOLATION] ${relativePath}:L${lineIdx + 1} - Graphics tier must be stateless and not import runtime/services: "${line.trim()}"`);
          hasViolations = true;
        }
      }
    }
  });
});

if (hasViolations) {
  console.error("Result: FAIL. Dependency violations found.");
  process.exit(1);
} else {
  console.log("Result: PASS. All import boundaries are validated!");
  process.exit(0);
}
