type MDXComponents = {
  [key: string]: React.ComponentType<any>;
};

import Mermaid from "@/components/mermaid";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Mermaid,
    ...components,
  };
}
