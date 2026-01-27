const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n Starting Blog Build..\n');

// Safe git command execution 
// Return empty string if command fails 

function safeGit(cmd) {
  try {
      return execSync(cmd, { 
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
  } catch (error) {
      return '';
  }
}

// Get the FIRST commit date for a file from git history

function getGitCreationDate(filePath) {
  try {
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Get all commits for this file, oldest first
      const output = safeGit(`git log --follow --reverse --format=%aI -- "${relativePath}"`);
      
      if (!output) {
          return null;
      }
      
      // Get the first line (oldest commit)
      const firstCommit = output.split('\n')[0];
      
      if (firstCommit) {
          // Extract just the date part (YYYY-MM-DD)
          return firstCommit.split('T')[0];
      }
      
      return null;
  } catch (error) {
      return null;
  }
}

function generateManifest() {
  const docsDir = path.join(__dirname, '../Docs');
  const articles = [];

  // Check Docs folder exists
  if (!fs.existsSync(docsDir)) {
      console.error('Docs folder not found!');
      process.exit(1);
  }

  const files = fs.readdirSync(docsDir);
  console.log(`Found ${files.length} files in Docs/\n`);

  const mdFiles = files.filter(file =>
      file.endsWith('.md') && 
      fs.statSync(path.join(docsDir, file)).isFile()
  );

  console.log(`✓ Found ${mdFiles.length} markdown files \n`);
  
  if (mdFiles.length === 0) {
      console.warn('No markdown files found in Docs/');
  }

  mdFiles.forEach(file => {
      try {
          const filePath = path.join(docsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Get creation date from git (ALWAYS syncs with git)
          let date = getGitCreationDate(filePath);
          
          // Fallback: use file modification time if not in git
          if (!date) {
              const stats = fs.statSync(filePath);
              date = new Date(stats.mtime)
                  .toISOString()
                  .split('T')[0];
              console.log(`  ✓ ${file} (${date}) [file mtime]`);
          } else {
              console.log(`  ✓ ${file} (${date}) [git history]`);
          }
          
          const { title, excerpt } = parseMarkdown(content);

          articles.push({
              title: title || file.replace('.md', '').replace(/-/g, ''),
              filename: file,
              date: date,
              excerpt: excerpt,
              content: content
          });
              
      } catch (error) {
          console.error(`✗ Error processing ${file}:`, error.message);           
      }
  });

  // Sort by date (newest first)
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Create output directory
  const outputDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write manifest
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(
      manifestPath,
      JSON.stringify(articles, null, 2)
  );

  console.log(`\nGenerated manifest.json with ${articles.length} articles`);
  console.log(`Location: ${manifestPath}\n`);
  
  return articles.length;
}

function parseMarkdown(content) {
  let title = 'Untitled';
  let excerpt = '';

  const lines = content.split('\n');

  // Find first heading
  for (const line of lines) {
      if (line.startsWith('#')) {
          title = line.replace(/^#+\s*/, '').trim();
          break;
      }
  }

  // Find first paragraph
  for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('```') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('*')) {
          excerpt = trimmed.substring(0, 150);
          if (excerpt.length === 150) {
              excerpt += '...';
          }
          break;
      }
  }

  return { title, excerpt };
}

try {
  const count = generateManifest();
  console.log('Build completed successfully!\n');
  process.exit(0);
} catch (error) {
  console.error('\nBuild failed:', error.message);
  process.exit(1);    
}