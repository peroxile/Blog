let articlesData = [];

async function loadArticles() {
    try {
        console.log('Loading articles from manifest...');

        // Fetch the pre-built manifest
        const response = await fetch('./data/manifest.json');

        if (!response.ok) {
            throw new Error(`Failed to load manifest: ${response.status}`);
        }

        const articles = await response.json();

        console.log(`✓ Loaded ${articles.length} articles`);

        if (articles.length === 0) {
            throw new Error('No articles found in manifest');
        }

        // Store in memory
        articlesData = articles;

        // Hide loading, show articles
        document.getElementById('loading').style.display = 'none';
        renderArticles(articles);
        updateStats(articles);

    } catch (error) {
        console.error(' Error loading articles:', error);
        document.getElementById('loading').style.display = 'none';
        showError(`Failed to load articles: ${error.message}`);
    }
}


 // Render articles as cards
 
function renderArticles(articles) {
    const container = document.getElementById('articles-container');

    if (articles.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No articles found.</p>';
        return;
    }

    container.innerHTML = articles.map((article, i) => `
        <div class="article-card" onclick="openArticle(${i})">
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


// Parse markdown to extract title and excerpt
 
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


// Open article in modal
 
function openArticle(index) {
    const article = articlesData[index];
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');

    try {
        // Convert markdown to HTML
        const html = markdownToHtml(article.content);

        body.innerHTML = `
            <h2>${escapeHtml(article.title)}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.9rem;">
                Published on ${formatDate(article.date)}
            </p>
            ${html}
        `;

        modal.style.display = 'block';

    } catch (error) {
        console.error('Error rendering article:', error);
        body.innerHTML = '<div class="error">Error loading article content.</div>';
    }
}


//  Close modal
 
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


// Convert markdown to HTML

function markdownToHtml(md) {
    let html = md;

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h2>$1</h2>');

    // Bold/Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Lists
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
        if (!p.match(/<[^>]+>/)) {
            return `<p>${p.trim()}</p>`;
        }
        return p;
    }).join('\n');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}


// Utility functions
 

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats(articles) {
    document.getElementById('total-count').textContent = articles.length;
    if (articles.length > 0) {
        document.getElementById('last-updated').textContent = formatDate(articles[0].date);
    }
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    errorEl.style.display = 'block';
}


// Theme management
 

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isDark = !document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.querySelector('.theme-toggle');
    const isDark = !document.body.classList.contains('light-mode');
    btn.textContent = isDark ? 'Light' : 'Dark';
}


// Initialize on page load
 

window.addEventListener('load', () => {
    // Restore theme preference
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeButton();

    // Load articles from manifest
    loadArticles();
});

// Close modal on outside click
window.onclick = (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) closeModal();
};