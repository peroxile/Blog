let articlesData = [];

async function loadArticles() {
    try {
        console.log('Loading articles from manifest...');

        const response = await fetch('./data/manifest.json');

        if (!response.ok) {
            throw new Error(`Failed to load manifest: ${response.status}`);
        }

        const articles = await response.json();

        console.log(`✓ Loaded ${articles.length} articles`);

        if (articles.length === 0) {
            throw new Error('No articles found in manifest');
        }

        articlesData = articles;

        document.getElementById('loading').style.display = 'none';
        renderArticles(articles);
        updateStats(articles);

    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('loading').style.display = 'none';
        showError(`Failed to load articles: ${error.message}`);
    }
}


// ─── Rendering ────────────────────────────────────────────────────────────────

function renderArticles(articles) {
    const container = document.getElementById('articles-container');

    if (articles.length === 0) {
        container.innerHTML = '<p class="no-results">No articles found.</p>';
        return;
    }

    container.innerHTML = articles.map((article, i) => `
        <div class="article-card" onclick="openArticle(${i})">
            <div class="article-header">
                <div class="article-title">${escapeHtml(article.title)}</div>
                <div class="article-icon">→</div>
            </div>
            <div class="article-meta">
                <span class="article-date">${formatDate(article.date)}</span>
                <span class="article-read-time">${readingTime(article.content)}</span>
            </div>
            <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
            <a href="#" class="article-link">Read more</a>
        </div>
    `).join('');
}


// ─── Search / filter ──────────────────────────────────────────────────────────

function handleSearch(query) {
    const q = query.toLowerCase().trim();

    if (!q) {
        renderArticles(articlesData);
        return;
    }

    const filtered = articlesData.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        (a.content && a.content.toLowerCase().includes(q))
    );

    const container = document.getElementById('articles-container');

    if (filtered.length === 0) {
        container.innerHTML = `<p class="no-results">No articles match "<em>${escapeHtml(query)}</em>".</p>`;
        return;
    }

    renderArticles(filtered);
}


// ─── Markdown parser ──────────────────────────────────────────────────────────

function parseMarkdown(content) {
    let title = 'Untitled';
    let excerpt = '';
    const lines = content.split('\n');

    for (const line of lines) {
        if (line.startsWith('#')) {
            title = line.replace(/^#+\s*/, '').trim();
            break;
        }
    }

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed &&
            !trimmed.startsWith('#') &&
            !trimmed.startsWith('```') &&
            !trimmed.startsWith('-') &&
            !trimmed.startsWith('*')) {
            excerpt = trimmed.substring(0, 150);
            if (excerpt.length === 150) excerpt += '...';
            break;
        }
    }

    return { title, excerpt };
}

function markdownToHtml(md) {
    let html = md;

    // Code blocks — wrapped for copy button
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
        const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<div class="code-block-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button><pre><code>${escaped}</code></pre></div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h2>$1</h2>');

    // Bold / Italic
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


// ─── Modal ────────────────────────────────────────────────────────────────────

function openArticle(index) {
    const article = articlesData[index];
    const modal = document.getElementById('modal');
    const body  = document.getElementById('modal-body');

    try {
        const html = markdownToHtml(article.content);

        body.innerHTML = `
            <h2>${escapeHtml(article.title)}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.9rem;">
                Published on ${formatDate(article.date)} · ${readingTime(article.content)}
            </p>
            ${html}
        `;

        modal.style.display = 'block';
        // Scroll modal to top on open
        modal.scrollTop = 0;

    } catch (error) {
        console.error('Error rendering article:', error);
        body.innerHTML = '<div class="error">Error loading article content.</div>';
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}


// ─── Copy code ────────────────────────────────────────────────────────────────

function copyCode(btn) {
    const code = btn.nextElementSibling.querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    });
}


// ─── Back to top ──────────────────────────────────────────────────────────────

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


// ─── Utilities ────────────────────────────────────────────────────────────────

function readingTime(content) {
    if (!content) return '';
    const words = content.trim().split(/\s+/).length;
    const mins  = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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


// ─── Theme ────────────────────────────────────────────────────────────────────

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isDark = !document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}


// ─── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('load', () => {
    // Restore theme
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') document.body.classList.add('light-mode');

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', e => handleSearch(e.target.value));
    }

    // Back to top
    initBackToTop();

    // Load articles
    loadArticles();
});

// Close modal on outside click
window.onclick = (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) closeModal();
};