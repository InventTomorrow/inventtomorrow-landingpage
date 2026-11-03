import type { Tool } from '../content/tools';

// A tool's logo, or a placeholder tile (glyph or first letter) until the real file is added to the content.
export function ToolLogo({ tool }: { tool: Tool }) {
  if (tool.logo) {
    return <img src={tool.logo} alt="" width={28} height={28} loading="lazy" className="h-7 w-7 shrink-0 object-contain" />;
  }

  const Glyph = tool.icon;
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold text-accent"
      aria-hidden="true"
    >
      {Glyph ? <Glyph className="h-3.5 w-3.5" /> : tool.name.charAt(0)}
    </span>
  );
}
