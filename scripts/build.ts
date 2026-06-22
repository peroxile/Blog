import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

type Article = {
  title: string;
  filename: string;
  date: string;
  excerpt: string;
  content: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n Starting Blog Build..\n");

// Safe git command execution
// Return empty string if command fails
function safeGit(cmd: string): string {
  try {
    return execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

// Get the FIRST commit date for a file from git history
function getGitCreationDate(filePath: string): string | null {
  try {
    const relativePath = path.relative(process.cwd(), filePath);

    const output = safeGit(
      `git log --follow --reverse --format=%aI -- "${relativePath}"`
    );

    if (!output) return null;

    const firstCommit = output.split("\n")[0];
    if (!firstCommit) return null;

    return firstCommit.split("T")[0] ?? null;
  } catch {
    return null;
  }
}

function parseMarkdown(content: string): { title: string; excerpt: string } {
  let title = "Untitled";
  let excerpt = "";

  const lines = content.split("\n");

  // Find first heading
  for (const line of lines) {
    if (line.startsWith("#")) {
      title = line.replace(/^#+\s*/, "").trim();
      break;
    }
  }

  // Find first paragraph
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("```") &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*")
    ) {
      excerpt = trimmed.substring(0, 150);
      if (excerpt.length === 150) {
        excerpt += "...";
      }
      break;
    }
  }

  return { title, excerpt };
}

function generateManifest(): number {
  const docsDir = path.join(__dirname, "../docs");
  const articles: Article[] = [];

  // Check docs folder exists
  if (!fs.existsSync(docsDir)) {
    console.error("docs folder not found!");
    process.exit(1);
  }

  const files = fs.readdirSync(docsDir);
  console.log(`Found ${files.length} files in docs/\n`);

  const mdFiles = files.filter(
    (file) =>
      file.endsWith(".md") && fs.statSync(path.join(docsDir, file)).isFile()
  );

  console.log(`✓ Found ${mdFiles.length} markdown files \n`);

  if (mdFiles.length === 0) {
    console.warn("No markdown files found in docs/");
  }

  mdFiles.forEach((file) => {
    try {
      const filePath = path.join(docsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Get creation date from git (ALWAYS syncs with git)
      let date = getGitCreationDate(filePath);

      // Fallback: use file modification time if not in git
      if (!date) {
        const stats = fs.statSync(filePath);
        date = stats.mtime.toISOString().split("T")[0];
        console.log(`  ✓ ${file} (${date}) [file mtime]`);
      } else {
        console.log(`  ✓ ${file} (${date}) [git history]`);
      }

      const { title, excerpt } = parseMarkdown(content);

      articles.push({
        title: title || file.replace(".md", "").replace(/-/g, ""),
        filename: file,
        date,
        excerpt,
        content,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ Error processing ${file}:`, message);
    }
  });

  // Sort by date (newest first)
  articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Create output directory
  const outputDir = path.join(__dirname, "../public/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write manifest
  const manifestPath = path.join(outputDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(articles, null, 2));

  console.log(`\nGenerated manifest.json with ${articles.length} articles`);
  console.log(`Location: ${manifestPath}\n`);

  return articles.length;
}

try {
  generateManifest();
  console.log("Build completed successfully!\n");
  process.exit(0);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\nBuild failed:", message);
  process.exit(1);
}
