import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;

// Built pages arrive with their HTML already in place (scripts/prerender.ts); the dev server sends an empty shell.
if (rootElement.hasAttribute('data-prerendered')) hydrateRoot(rootElement, <App />);
else createRoot(rootElement).render(<App />);
