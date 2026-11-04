// Holds the page's place while its code loads, so the footer doesn't jump up and down.
export function PageFallback() {
  return <div className="min-h-[70vh]" aria-busy="true" />;
}
