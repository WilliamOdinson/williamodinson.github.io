type MDXComponents = {
  [key: string]: React.ComponentType<any>;
};

import Mermaid from "@/components/mermaid";
import CodeBlock from "@/components/code-block";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Mermaid,
    /* Markdown code block renders through this <pre> */
    pre: CodeBlock,
    ...components,
  };
}
