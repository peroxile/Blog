const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = safeGitRoot();
const DOCS_DIR = path.join(REPO_ROOT, 'Docs');
const OUT_DIR = path.join(REPO_ROOT, 'public/data');
const OUT_FILE = path.join(OUT_DIR, 'manifest.json');

function safeGitRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
  } catch {
    return process.cwd();
  }
}

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function getGitDates(filePath) {
  const rel = path.relative(REPO_ROOT, filePath);

  const created = runGit(
    `git log --follow --reverse --format=%aI -- "${rel}"`
  ).split('\n')[0];

  const updated = runGit(
    `git log -1 --format=%aI -- "${rel}"`
  );

  return {
    created: created ? created.split('T')[0] : null,
    updated: updated ? updated.split('T')[0] : null
  };
}

function extractFrontMatterDate(content) {
  const m = content.match(/^---[\s\S]*?date:\s*(\d{4}-\d{2}-\d{2})/m);
  return m ? m[1] : null;
}

function parseMarkdown(content) {
  let title = 'Untitled';
  let excerpt = '';

  const lines = content.split('\n');

  for (const l of lines) {
    if (l.startsWith('#')) {
      title = l.replace(/^#+\s*/, '').trim();
      break;
    }
  }

  for (const l of lines) {
    const t = l.trim();
    if (t && !/^(#|```|-|\*)/.test(t)) {
      excerpt = t.slice(0, 150);
      break;
    }
  }

  return { title, excerpt };
}

function resolveDates(filePath, content) {
  const gitDates = getGitDates(filePath);
  const fmDate = extractFrontMatterDate(content);

  if (gitDates.created) {
    return gitDates;
  }

  if (fmDate) {
    return { created: fmDate, updated: fmDate };
  }

  return { created: 'DRAFT', updated: 'DRAFT' };
}

function generateManifest() {
  if (!fs.existsSync(DOCS_DIR)) {
    throw new Error('Docs directory missing');
  }

  const files = fs.readdirSync(DOCS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(DOCS_DIR, f))
    .filter(f => fs.statSync(f).isFile());

  const articles = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { title, excerpt } = parseMarkdown(content);
    const { created, updated } = resolveDates(filePath, content);

    articles.push({
      title,
      filename: path.basename(filePath),
      created,
      updated,
      excerpt,
      content
    });
  }

  articles.sort((a, b) => new Date(b.created) - new Date(a.created));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(articles, null, 2));
}

generateManifest();
