/**
 * mdx-estree — Turn a plain JSON-like value into an ESTree expression.
 *
 * The remark plugins use this to inject `export const metadata = { … }` and
 * JSX attribute expressions into MDX modules without adding
 * estree-util-value-to-estree as a dependency. Supports null, undefined,
 * strings, numbers, booleans, arrays and plain objects; anything else is
 * stringified.
 */

/**
 * @param {unknown} v
 * @returns {import("estree").Expression}
 */
export function valueToEstree(v) {
  if (v === null || v === undefined) {
    return { type: "Literal", value: null, raw: "null" };
  }
  if (typeof v === "string") {
    return { type: "Literal", value: v, raw: JSON.stringify(v) };
  }
  if (typeof v === "number") {
    return { type: "Literal", value: v, raw: String(v) };
  }
  if (typeof v === "boolean") {
    return { type: "Literal", value: v, raw: String(v) };
  }
  if (Array.isArray(v)) {
    return { type: "ArrayExpression", elements: v.map(valueToEstree) };
  }
  if (typeof v === "object") {
    return {
      type: "ObjectExpression",
      properties: Object.entries(v)
        .filter(([, val]) => val !== undefined)
        .map(([key, val]) => ({
          type: "Property",
          method: false,
          shorthand: false,
          computed: false,
          /* A string key survives labels like "Screen size" that are not identifiers. */
          key: { type: "Literal", value: key, raw: JSON.stringify(key) },
          value: valueToEstree(val),
          kind: "init",
        })),
    };
  }
  return { type: "Literal", value: String(v), raw: JSON.stringify(String(v)) };
}

/**
 * Wrap an expression as the ESTree program an `mdxJsxAttributeValueExpression`
 * node carries in `data.estree`.
 *
 * @param {import("estree").Expression} expression
 * @returns {import("estree").Program}
 */
export function expressionProgram(expression) {
  return {
    type: "Program",
    sourceType: "module",
    body: [{ type: "ExpressionStatement", expression }],
  };
}
