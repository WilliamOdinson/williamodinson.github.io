/**
 * remark-sale-item
 *
 * A remark plugin for the second-hand listings under `src/app/sale/<slug>/`.
 * It validates the page's front-matter and wraps the whole body in
 *
 *     <SaleItemPage item={{ … }}>…description…</SaleItemPage>
 *
 * so an item page is nothing more than front-matter plus an optional
 * Markdown description. `SaleItemPage` (registered in mdx-components.tsx)
 * renders the gallery, price, condition, contact button and structured data
 * around that description.
 *
 * Must run AFTER `remark-frontmatter` (which creates the YAML node) and after
 * `remark-next-metadata` (whose `export const metadata` has to stay at module
 * level). ESM nodes are left in place; only content nodes move into the wrapper.
 */
import matter from "gray-matter";
import { normalizeSaleItem } from "./sale.mjs";
import { expressionProgram, valueToEstree } from "./mdx-estree.mjs";

/**
 * ".../src/app/sale/malm-desk/page.mdx" → "malm-desk"; null for any other file.
 */
function saleSlugFromFile(vfile) {
  const filePath = vfile.path || vfile.history?.[0] || "";
  const match = filePath.match(
    /src[\\/]app[\\/]sale[\\/]([^\\/]+)[\\/]page\.mdx?$/,
  );
  return match ? match[1] : null;
}

export default function remarkSaleItem() {
  return (tree, vfile) => {
    const slug = saleSlugFromFile(vfile);
    if (!slug) return;

    /* ---- parse and validate front-matter; a bad listing fails the build ---- */
    const yamlNode = tree.children.find((node) => node.type === "yaml");
    const { data } = matter(yamlNode ? `---\n${yamlNode.value}\n---` : "");
    const item = normalizeSaleItem(data, slug);

    /* ---- split module-level nodes from page content ---- */
    const moduleLevel = [];
    const body = [];
    for (const node of tree.children) {
      (node.type === "yaml" || node.type === "mdxjsEsm" ? moduleLevel : body).push(
        node,
      );
    }

    /* ---- <SaleItemPage item={…}>{body}</SaleItemPage> ---- */
    tree.children = [
      ...moduleLevel,
      {
        type: "mdxJsxFlowElement",
        name: "SaleItemPage",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "item",
            value: {
              type: "mdxJsxAttributeValueExpression",
              value: JSON.stringify(item),
              data: { estree: expressionProgram(valueToEstree(item)) },
            },
          },
        ],
        children: body,
      },
    ];
  };
}
