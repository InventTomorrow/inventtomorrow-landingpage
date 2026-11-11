import { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { SiteLayout } from './components/SiteLayout';
import { prefetchPages } from './pages/lazyPages';
import { startSmoothScroll } from './utils/smoothScroll';

export default function App() {
  useEffect(() => startSmoothScroll(), []);
  useEffect(() => prefetchPages(), []);

  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  );
}
