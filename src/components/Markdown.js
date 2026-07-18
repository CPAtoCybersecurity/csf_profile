import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Single source of truth for rendering markdown across the app.
//
// react-markdown is CommonMark-only, which does NOT include GitHub Flavored
// Markdown tables. Without the remark-gfm plugin, a multi-line pipe table
// collapses into one soft-wrapped paragraph (issue #276). Routing every
// <ReactMarkdown> through this wrapper enables GFM (tables, strikethrough,
// task lists, autolinks) everywhere and prevents the plugin from being
// forgotten at a future render site.
//
// The rendered <table>/<th>/<td> inherit the app's global terminal table
// styles from index.css — no per-site table CSS is needed.

// gfm is prepended (not spread-overridable) so a caller passing its own
// remarkPlugins augments rather than silently drops it — otherwise a future
// `<Markdown remarkPlugins={[remarkBreaks]}>` would reintroduce issue #276.
const Markdown = ({ children, remarkPlugins = [], ...props }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm, ...remarkPlugins]} {...props}>
    {children}
  </ReactMarkdown>
);

export default Markdown;
