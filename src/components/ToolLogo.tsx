import type { Tool } from '../content/tools';

// Every tool has local artwork, including the custom business-line icon.
export function ToolLogo({ tool }: { tool: Tool }) {
  return (
    <img
      src={tool.logo}
      alt=""
      width={40}
      height={40}
      decoding="async"
      className="h-10 w-10 shrink-0 object-contain"
    />
  );
}
