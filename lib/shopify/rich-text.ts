/**
 * Shopify `rich_text` → HTML.
 *
 * A `rich_text` metafield/metaobject field does **not** return HTML. It returns
 * a JSON document: `{ type: "root", children: [...] }` with paragraph, heading,
 * list, list-item, link, and text nodes. The journal's `bodyHtml` therefore has
 * to be rendered here rather than passed through.
 *
 * Everything text-shaped is HTML-escaped, and `link.url` is restricted to
 * http/https/mailto. Editors are trusted, but a rich-text field is still a
 * string that ends up inside `dangerouslySetInnerHTML`, and `javascript:` in an
 * href would survive an editor's own review.
 */

interface TextNode {
  type: "text";
  value?: string;
  bold?: boolean;
  italic?: boolean;
}

interface LinkNode {
  type: "link";
  url?: string;
  title?: string;
  children?: RichTextNode[];
}

interface ContainerNode {
  type: "root" | "paragraph" | "heading" | "list" | "list-item";
  level?: number;
  listType?: "unordered" | "ordered";
  children?: RichTextNode[];
}

type RichTextNode = TextNode | LinkNode | ContainerNode;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Only protocols that cannot execute script. */
function safeHref(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return escapeHtml(trimmed);
  if (trimmed.startsWith("/")) return escapeHtml(trimmed);
  return null;
}

function renderChildren(nodes: RichTextNode[] | undefined): string {
  if (!nodes) return "";
  return nodes.map(renderNode).join("");
}

function renderNode(node: RichTextNode): string {
  switch (node.type) {
    case "text": {
      let html = escapeHtml(node.value ?? "");
      if (node.bold) html = `<strong>${html}</strong>`;
      if (node.italic) html = `<em>${html}</em>`;
      return html;
    }
    case "link": {
      const href = safeHref(node.url);
      const inner = renderChildren(node.children);
      if (!href) return inner; // Drop the anchor, keep the words.
      return `<a href="${href}" rel="noopener noreferrer">${inner}</a>`;
    }
    case "paragraph":
      return `<p>${renderChildren(node.children)}</p>`;
    case "heading": {
      // Clamp: an article body must never emit an <h1>, which belongs to the
      // page, and never a level Shopify's editor cannot produce.
      const level = Math.min(Math.max(node.level ?? 2, 2), 6);
      return `<h${level}>${renderChildren(node.children)}</h${level}>`;
    }
    case "list": {
      const tag = node.listType === "ordered" ? "ol" : "ul";
      return `<${tag}>${renderChildren(node.children)}</${tag}>`;
    }
    case "list-item":
      return `<li>${renderChildren(node.children)}</li>`;
    case "root":
      return renderChildren(node.children);
    default:
      return "";
  }
}

/**
 * Returns `undefined` for an absent or unparseable field rather than throwing —
 * one malformed article body should not take down the journal.
 */
export function richTextToHtml(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return undefined;
    return renderNode(parsed as RichTextNode) || undefined;
  } catch {
    // Some stores author the field as plain HTML in a multi_line_text_field and
    // migrate later. If it is not JSON, it is not ours to interpret.
    return undefined;
  }
}
