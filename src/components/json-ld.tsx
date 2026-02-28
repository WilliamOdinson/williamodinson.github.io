/**
 * JsonLd: Renders a `<script type="application/ld+json">` tag.
 *
 * Accepts a pre-serialised JSON string so it can be injected by remark
 * plugins at build time without complex ESTree attribute expressions.
 */
export default function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
