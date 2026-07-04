// Shared helpers for rendering catalog/user text as markdown.
//
// Catalog content often arrives as one long line, so "### Heading" and
// " - **item**" markers need real line breaks before ReactMarkdown can
// render them (CommonMark headings/lists must start a line).

// Format single-line markdown-ish text into renderable markdown.
export const formatInlineMarkdown = (text) => {
  if (!text) return '';
  if (text.includes('\n')) return text; // already multi-line markdown — render as-is

  return text
    .replace(/\s*(#{1,6})\s+/g, '\n\n$1 ') // headings onto their own line
    .replace(/\s+-\s+(?=\*\*)/g, '\n- ')   // "- **item**" markers into list lines
    .replace(/^\n+/, '');
};

// Strip markdown syntax for plain-text previews (e.g. truncated table cells).
export const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code blocks
    .replace(/`([^`]*)`/g, '$1')              // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // links
    .replace(/^#{1,6}\s+/gm, '')              // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2')       // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')          // italic
    .replace(/^\s*[-*+]\s+/gm, '')            // list markers
    .replace(/^\s*\d+\.\s+/gm, '')            // numbered list markers
    .replace(/^\s*>\s?/gm, '')                // blockquotes
    .replace(/\s+/g, ' ')                     // collapse whitespace
    .trim();
};
