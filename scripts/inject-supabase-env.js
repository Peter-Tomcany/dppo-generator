/**
 * inject-supabase-env.js
 * Netlify build script – replaces empty Supabase placeholders
 * in index.html with real values from environment variables.
 *
 * Required Netlify env vars:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *
 * index.html must contain:
 *   const SUPABASE_URL = '';
 *   const SUPABASE_ANON_KEY = '';
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY not set – skipping injection.');
        process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Replace the empty placeholder values in-place
html = html.replace(
        "const SUPABASE_URL = '';",
        `const SUPABASE_URL = '${SUPABASE_URL}';`
      );

html = html.replace(
        "const SUPABASE_ANON_KEY = '';",
        `const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';`
      );

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅  Supabase env variables injected into index.html');
