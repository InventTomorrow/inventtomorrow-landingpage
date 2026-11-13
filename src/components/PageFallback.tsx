// Startup already has one persistent full-screen loader. Lazy routes reserve
// their space without mounting another logo or restarting the startup animation.
export function PageFallback() {
  return <div className="page-loading" role="status" aria-busy="true" aria-label="Loading page"><span className="sr-only">Loading page</span></div>;
}
