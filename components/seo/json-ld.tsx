import type { JsonLdObject } from "@/lib/seo/jsonld";

/**
 * Emit a JSON-LD document.
 *
 * A Server Component: structured data is markup, not behaviour, and ships zero
 * JavaScript.
 *
 * `<` is escaped to `<`. JSON-LD lives inside a `<script>` element, where
 * the HTML parser looks for the literal string `</script>` before the JavaScript
 * parser ever sees the content. Any product title, article excerpt, or Shopify
 * description containing `</script` would otherwise close the block early and
 * inject the remainder into the document. `JSON.stringify` does not protect
 * against this; escaping the angle bracket does, and produces an identical
 * parse.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // Serialized above; the escape makes early-termination impossible.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
