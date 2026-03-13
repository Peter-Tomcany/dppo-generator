/**
 * inject-supabase-env.js
 * Netlify build script – injects Supabase environment variables
 * into index.html so that secrets stay out of the repository.
 *
 * Required Netlify env vars:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *
 * The app expects plain JS constants:
 *   const SUPABASE_URL = '...';
 *   const SUPABASE_ANON_KEY = '...';
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

// Inject a <script> block with the env config right before </head>
const snippet = `
<script>
  const SUPABASE_URL = '${SUPABASE_URL}';
    const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
    </script>`;

if (html.includes('</head>')) {
      html = html.replace('</head>', snippet + '\n</head>');
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('✅ Supabase env variables injected into index.html');
} else {
      console.error('❌ Could not find </head> in index.html');
      process.exit(1);
}
