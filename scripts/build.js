
const fs = require('fs');
const path = require('path');

console.log('\n Starting Blog Build..\n');

function generateManifest() {
    const docsDir = path.join(__dirname, '../Docs');
    const articles = [];

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
            console.warn(' No markdown files found in Docs/');
        }

    mdFiles.forEach(file => {
        try {
            const filePath = path.join(docsDir, file);

            const content = fs.readFileSync(filePath, 'utf-8');

            //  Get Original Creation date from git
            let date = getGitCreationDate(filePath);
            
            // Fallback: Use file modification time if no git

            if (!date) {
                const stats = fs.statSync(filePath);
                date = new Date(stats.mtime)
                .toISOString()
                .split('T')[0];
            }

                const {title, excerpt } = parseMarkdown(content);

                articles.push({
                    title: title || file.replace('.md', '').replace(/-/g, ''),
                    filename: file,
                    date: date,
                    excerpt: excerpt,
                    content: content
                });
                
                console.log(` ✓ ${file} (${date})`);
                
        } catch (error) {
            console.error( `✗ Error processing ${file}:`, error.message);           
        }
    });

    articles.sort((a,b) => new Date(b.date) - new Date(a.date));

    const outputDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true});
    }

    const manifestPath = path.join(outputDir, 'manifest.json');
    fs.writeFileSync(
        manifestPath,
        JSON.stringify(articles, null, 2)
    );

    console.log(`\n Generated manifest.json with ${articles.length} articles`);
    console.log(`Location ${manifestPath}\n`);
    
    return articles.length;
}

function getGitCreationDate(filePath) {
    try {
        // Get the file's relative path
        const relativePath = path.relative(process.cwd(), filePath);

        // Get git log (oldest commit first)
        const command = `git log --follow --format=%aI --"${relativePath}" | tail -1`;
        const result = exeSync(command, {encoding: 'utf-8'}).trim();

        if (result) {
        // Extract just the date (YYYY-MM-DD)
            return result.split('T')[0];
        }

        return null;
    } catch (error) {
        // If git command fails, return null (use file mtime)
        return null;
    }
}

function parseMarkdown(content) {
    let title = 'Untitled'
    let excerpt = '';

    const lines = content.split('\n');

    // Find first heading (#)
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
    console.log(` Yeah ${count} files to production :) \n Build completed successfully!\n`);
    process.exit(0);
} catch (error) {
    console.error('\n Build failed:', error.message);
    process.exit(1);    
}
