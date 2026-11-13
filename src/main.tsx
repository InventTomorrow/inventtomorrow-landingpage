import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import { getBrowserSessionId } from './utils/sessionId';
import { captureBrowserAttribution } from './utils/attribution';
import './index.css';

// Establish the visitor ID on every entry page, before any chat or form mounts.
getBrowserSessionId();
// Keep the landing page's ad tags; client-side navigation drops them from the URL.
captureBrowserAttribution();

const rootElement = document.getElementById('root')!;

// The single startup overlay lives outside React, so mounting the header and
// resolving a lazy route cannot replace it or restart its animation.
if (document.getElementById('app-bootstrap')) rootElement.inert = true;

// Built pages arrive with their HTML already in place (scripts/prerender.ts); the dev server sends an empty shell.
if (rootElement.hasAttribute('data-prerendered')) hydrateRoot(rootElement, <App />);
else createRoot(rootElement).render(<App />);
