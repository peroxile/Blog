import "../styles/main.css";

export {};

type Theme = "dark" | "light";

interface Article {
  title: string;
  filename: string;
  published: string;
  modified: string | null;
  excerpt: string;
  content: string;
}

declare global {
  interface Window {
    openArticle: (index: number) => void;
    closeModal: () => void;
    copyCode: (btn: HTMLButtonElement) => void;
    toggleTheme: () => void;
  }
}

let articlesData: Article[] = [];

function getRequiredElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required element: #${id}`);
  }
  return el as T;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function readingTime(content: string): string {
  if (!content) return "";
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function updateStats(articles: Article[]): void {
  getRequiredElement<HTMLElement>("total-count").textContent = String(articles.length);

  if (articles.length > 0) {
    getRequiredElement<HTMLElement>("last-updated").textContent = formatDate(
      articles[0].modified ?? articles[0].published
    );
  }
}

function showError(message: string): void {
  const errorEl = getRequiredElement<HTMLElement>("error");
  errorEl.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
  errorEl.style.display = "block";
}

function renderArticles(articles: Article[]): void {
  const container = getRequiredElement<HTMLElement>("articles-container");

  if (articles.length === 0) {
    container.innerHTML = '<p class="no-results">No articles found.</p>';
    return;
  }

  container.innerHTML = articles
    .map(
      (article, i) => `
        <div class="article-card" onclick="openArticle(${i})">
          <div class="article-header">
            <div class="article-title">${escapeHtml(article.title)}</div>
          </div>
          <div class="article-meta">
            <span class="article-date">Published ${formatDate(article.published)}</span>
            ${
              article.modified
                ? `<span class="article-date">Modified ${formatDate(article.modified)}</span>`
                : ""
            }
            <span class="article-read-time">${readingTime(article.content)}</span>
          </div>
          <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
        </div>
      `
    )
    .join("");
}

function handleSearch(query: string): void {
  const q = query.toLowerCase().trim();

  if (!q) {
    renderArticles(articlesData);
    return;
  }

  const filtered = articlesData.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
  );

  const container = getRequiredElement<HTMLElement>("articles-container");

  if (filtered.length === 0) {
    container.innerHTML = `<p class="no-results">No articles match "<em>${escapeHtml(query)}</em>".</p>`;
    return;
  }

  renderArticles(filtered);
}

function markdownToHtml(md: string): string {
  let html = md;

  html = html.replace(/```([\s\S]*?)```/g, (_match, code: string) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<div class="code-block-wrapper"><button class="copy-btn" onclick="copyCode(this)">Copy</button><pre><code>${escaped}</code></pre></div>`;
  });

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/^\- (.*?)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
  html = html.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");

  html = html
    .split("\n\n")
    .map((p) => {
      if (!p.match(/<[^>]+>/)) {
        return `<p>${p.trim()}</p>`;
      }
      return p;
    })
    .join("\n");

  html = html.replace(/\n/g, "<br>");

  return html;
}

function openArticle(index: number): void {
  const article = articlesData[index];
  if (!article) return;

  const modal = getRequiredElement<HTMLDivElement>("modal");
  const body = getRequiredElement<HTMLElement>("modal-body");

  try {
    const html = markdownToHtml(article.content);
    const modifiedText = article.modified ? ` · Modified on ${formatDate(article.modified)}` : "";

    body.innerHTML = `
      <h2>${escapeHtml(article.title)}</h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.9rem;">
        Published on ${formatDate(article.published)}${modifiedText} · ${readingTime(article.content)}
      </p>
      ${html}
    `;

    modal.style.display = "block";
    modal.scrollTop = 0;

    history.pushState(null, "", `#${slugify(article.title)}`);
  } catch (error: unknown) {
    console.error("Error rendering article:", error);
    body.innerHTML = '<div class="error">Error loading article content.</div>';
  }
}

function closeModal(): void {
  getRequiredElement<HTMLDivElement>("modal").style.display = "none";
  history.pushState(null, "", location.pathname);
}

function copyCode(btn: HTMLButtonElement): void {
  const code = btn.nextElementSibling?.querySelector("code")?.textContent ?? "";
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  });
}

function initBackToTop(): void {
  const btn = getRequiredElement<HTMLButtonElement>("back-to-top");

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  });

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function toggleTheme(): void {
  document.body.classList.toggle("light-mode");
  const isDark = !document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function handleHash(): void {
  const hash = location.hash.slice(1);
  if (!hash) return;

  const index = articlesData.findIndex((a) => slugify(a.title) === hash);
  if (index !== -1) openArticle(index);
}

async function loadArticles(): Promise<void> {
  try {
    console.log("Loading articles from manifest...");

    const response = await fetch("/data/manifest.json");

    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    const articles = (await response.json()) as Article[];

    console.log(`✓ Loaded ${articles.length} articles`);

    if (articles.length === 0) {
      throw new Error("No articles found in manifest");
    }

    articlesData = articles;

    getRequiredElement("loading").style.display = "none";
    renderArticles(articles);
    updateStats(articles);
    handleHash();
  } catch (error: unknown) {
    console.error("Error loading articles:", error);
    getRequiredElement("loading").style.display = "none";
    showError(
      `Failed to load articles: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function bootstrap(): void {
  const theme = (localStorage.getItem("theme") as Theme | null) || "dark";
  if (theme === "light") document.body.classList.add("light-mode");

  const searchInput = document.getElementById("search-input");
  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      handleSearch(target?.value ?? "");
    });
  }

  initBackToTop();
  loadArticles();
}

window.openArticle = openArticle;
window.closeModal = closeModal;
window.copyCode = copyCode;
window.toggleTheme = toggleTheme;

window.addEventListener("click", (e: MouseEvent) => {
  const modal = getRequiredElement<HTMLDivElement>("modal");
  if (e.target === modal) closeModal();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}