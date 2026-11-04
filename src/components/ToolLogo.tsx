import type { Tool } from '../content/tools';

// A tool's logo, or a placeholder tile (glyph or first letter) until the real file is added to the content.
export function ToolLogo({ tool }: { tool: Tool }) {
  if (tool.logo) {
    return <img src={tool.logo} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0 object-contain" />;
  }

  const Glyph = tool.icon;
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-accent-soft text-base font-bold text-accent"
      aria-hidden="true"
    >
      {Glyph ? <Glyph className="h-5 w-5" /> : tool.name.charAt(0)}
    </span>
  );
}
