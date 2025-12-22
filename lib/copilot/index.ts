/**
 * Document Index System for Copilot RAG
 * Scans docs and creates an index with titles, summaries, and keywords
 */

import fs from 'fs';
import path from 'path';

export interface DocEntry {
    filename: string;
    title: string;
    summary: string;
    keywords: string[];
}

let cachedIndex: DocEntry[] | null = null;
let lastIndexTime: number = 0;
const INDEX_TTL = 60 * 60 * 1000; // 1 hour cache

function extractTitle(content: string): string {
    // Look for first H1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();

    // Fallback: first non-empty line
    const lines = content.split('\n').filter(l => l.trim());
    return lines[0]?.replace(/^#+\s*/, '').trim() || 'Untitled';
}

function extractSummary(content: string): string {
    // Skip frontmatter if present
    let cleanContent = content;
    if (content.startsWith('---')) {
        const endFrontmatter = content.indexOf('---', 3);
        if (endFrontmatter > 0) {
            cleanContent = content.slice(endFrontmatter + 3);
        }
    }

    // Remove headings and get first meaningful paragraph
    const lines = cleanContent.split('\n');
    let summary = '';

    for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines, headings, and code blocks
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```')) continue;

        summary = trimmed;
        break;
    }

    // Limit to 200 chars
    if (summary.length > 200) {
        summary = summary.slice(0, 200) + '...';
    }

    return summary;
}

function extractKeywords(content: string): string[] {
    const keywords: Set<string> = new Set();

    // Extract from headings
    const headingMatches = content.matchAll(/^#+\s+(.+)$/gm);
    for (const match of headingMatches) {
        const heading = match[1].toLowerCase();
        // Split heading into words and add significant ones
        heading.split(/\s+/).forEach(word => {
            if (word.length > 3) keywords.add(word);
        });
    }

    // Add some common important terms if found
    const importantTerms = ['pnode', 'validator', 'storage', 'xandeum', 'setup', 'install', 'configure', 'troubleshoot', 'api', 'rpc'];
    importantTerms.forEach(term => {
        if (content.toLowerCase().includes(term)) {
            keywords.add(term);
        }
    });

    return Array.from(keywords).slice(0, 10);
}

function scanDirectory(dirPath: string): DocEntry[] {
    const entries: DocEntry[] = [];

    if (!fs.existsSync(dirPath)) {
        return entries;
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (!stat.isFile()) continue;

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            entries.push({
                filename: file,
                title: extractTitle(content),
                summary: extractSummary(content),
                keywords: extractKeywords(content),
            });
        } catch (error) {
            console.error(`Error indexing ${file}:`, error);
        }
    }

    return entries;
}

export function getDocumentIndex(forceRefresh = false): DocEntry[] {
    const now = Date.now();

    if (!forceRefresh && cachedIndex && (now - lastIndexTime) < INDEX_TTL) {
        return cachedIndex;
    }

    console.log('[docIndex] Building document index...');

    const xandeumDocsDir = path.join(process.cwd(), 'docs', 'xandeum');
    const localDocsDir = path.join(process.cwd(), 'docs');

    // Scan Xandeum docs (from sync)
    const xandeumDocs = scanDirectory(xandeumDocsDir);

    // Scan local docs (USER_GUIDE, API, etc.) - exclude xandeum subdir
    const localDocs = scanDirectory(localDocsDir).filter(d =>
        !['xandeum'].includes(d.filename.replace('.md', ''))
    );

    cachedIndex = [...xandeumDocs, ...localDocs];
    lastIndexTime = now;

    console.log(`[docIndex] Indexed ${cachedIndex.length} documents`);

    return cachedIndex;
}

export function getDocumentContent(filename: string): string | null {
    // Try xandeum docs first
    const xandeumPath = path.join(process.cwd(), 'docs', 'xandeum', filename);
    if (fs.existsSync(xandeumPath)) {
        return fs.readFileSync(xandeumPath, 'utf-8');
    }

    // Try local docs
    const localPath = path.join(process.cwd(), 'docs', filename);
    if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath, 'utf-8');
    }

    return null;
}

export function formatIndexForPrompt(index: DocEntry[]): string {
    return index.map((doc, i) =>
        `${i + 1}. **${doc.filename}** - ${doc.title}\n   Summary: ${doc.summary}\n   Keywords: ${doc.keywords.join(', ')}`
    ).join('\n\n');
}
