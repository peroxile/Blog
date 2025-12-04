const articlesData = [];

function getGitConfig() {

    const currentUrl = window.location.href;

    const ghPagesPattern = /https:\/\/([^.]+)\.github\.io\/([^/]+)/;
    const ghPagesMatch = currentUrl.match(ghPagesPattern);


    if (ghPagesMatch) {
        return {
            owner : ghPagesPattern[1],
            repo: ghPagesMatch[2] || 'Blog',
            autoDetected: true
        };  
    }

    return {
        owner: 'YOUR_GITHUB_USERNAME',
        repo: 'Blog',
        autoDetected: false
    };
}

async function loadArticles() {
    try {
        const { owner, repo, autoDetected } = getGitConfig();
        const docsPath = 'Docs';

        if(autoDetected) {
            console.log(`Auto-detected: https://github.com/${owner}/{repo}`); 
        } else {
            console.log(`Using config: https://github.com/${owner}/{repo}`);
        }

        const apiUrl = `https://github.com/repos/${owner}/${repo}/contents/${docsPath}`;

        console.log(' Fetching from:', apiUrl);

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error (`Github API error: ${response.status} - Make sure repo exists and is public`);
        }

        const files = await response.json();

        const markdownFiles = files.filter(file =>
            file.name.endsWith('.md') && file.type === 'file'
        );

        console.log(`Found ${markdownFiles.length} markdown files `);

        if (markdownFiles.length === 0) {
            throw new Error ('No markdown files found in Docs folder')
        }

        const articles = [];

    for (const file of markdownFiles) {
        try {
            const contentResponse = await fetch(file.download_url);
            const rawContent = await contentResponse.text();

            const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${docsPath}/${file.name}&per_page=1`;
            const commitsResponse = await fetch(commitsUrl);
            const commits = await commitsResponse.json();

            const date = commits.length > 0
            ? commits[0].commit.author.date.split('T')[0]
            : new Date().toISOString().split('T')[0];

            const { title, excerpt } = parseMarkdown(rawContent);

            articles.push({
                title: title || file.name.replace('.md', '').replace(/-/g, ' '),
                filename: file.name, 
                date: date,
                excerpt: excerpt,
                content: rawContent
            });


        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            
        }

    }

    articles.sort((a,b) => new Date(b.date) - new Date(a.date));

    articlesData.push(...articles);
    
    document.getElementById('loading').style.display = 'none';

    renderArticles(articles);
    updateStats(articles);

    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('loading').style.display = 'none';
        showError(` Failed to load articles: ${error.message}`);
    }
}

// Parse Markdown

function parseMarkdown(content) {
    let title = 'Untitled';
    let excerpt = '';

    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
            title = lines[i].replace(/^#+\s*/, '').trim();
                break;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip headings, empty lines, and code blocks
        if (line &&
            !line.startsWith('#') &&
            !line.startsWith('```') &&
            !line.startsWith('-') &&
            !line.startsWith('*')) {
                excerpt = line.substring(0, 150);
            if (excerpt.length === 150) {
                excerpt += '...';
            }
            break;
        }
    }

    return { title, excerpt };

}

// Rendering

function renderArticles(articles) {
    const container = document.getElementById('articles-container');

    if (articles.length === 0) {
        container.innerHTML = '<p style="color: #665; padding: 2rem;">No articles found in Docs folder. </p>';
        return;
    }

    container.innerHTML = articles.map((article, index) => `
        <div class="article-card" onclick="openArticle(${index})">
            <div class="article-header">
                <div class="article-title">${escapeHtml(article.title)}</div>
                <div class="article-icon">→</div>
            </div>
            <div class="article-date">${formatDate(article.date)}</div>
            <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
            <a href="#" class="article-link">Read more</a>
        </div> 
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Modal Management

async function openArticle(index) {
    const article = articlesData[index];
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');


    modalBody.innerHTML = `<div class="loading">Loading...</div>`;
    modal.style.display = 'block';

    try {
        const htmlContent = markdownToHtml(article.content);

        const fullContent = `
        <h2>${escapeHtml(article.title)}</h2>
        <p style="665; margin-bottom: 2rem; font-size: 0.9rem;">
            Published on ${formatDate(article.date)}
        </p>
            ${htmlContent}
        `;
        modalBody.innerHTML = fullContent;

    } catch (error) {
        console.error('Error rendering article:', error);
        modalBody.innerHTML = '<div class="error">Failed to load article content.</div>';
        
    }
}

function markdownToHtml(markdown) {
    let html = markdown;
    
    // 1. Code blocks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // 2. Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 3. Headings (# ## ###)
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h2>$1</h2>');
    
    // 4. Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // 5. Links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 6. Unordered lists (- item)
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // 7. Numbered lists (1. item)
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    
    // 8. Paragraphs (split by double newline)
    html = html.split('\n\n').map(para => {
        if (!para.match(/<[^>]+>/)) { // If not already HTML tag
            return `<p>${para.trim()}</p>`;
        }
        return para;
    }).join('\n');
    
    // 9. Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Close Modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
}

function updateStats(articles) {
    document.getElementById('total-count').textContent = articles.length;
    if (articles.length > 0) {
        document.getElementById('last-updated').textContent = formatDate(articles[0].date);
    }
}

// Display error message 
function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    errorEl.style.display = 'block';
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isDarkMode = !document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.querySelector('.theme-toggle');
    const isDarkMode = !document.body.classList.contains('light-mode');
    btn.textContent = isDarkMode ? 'Light' : 'Dark';
}


window.addEventListener('load', () =>{
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeButton();

    loadArticles();
});

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};