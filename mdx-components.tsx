type MDXComponents = {
  [key: string]: React.ComponentType<any>;
};

import Mermaid from "@/components/mermaid";
import CodeBlock from "@/components/code-block";
import MdxImage from "@/components/mdx-image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Mermaid,
    /* Markdown code block renders through this <pre> */
    pre: CodeBlock,
    /* Clickable images with lightbox */
    img: MdxImage,
    ...components,
  };
}
