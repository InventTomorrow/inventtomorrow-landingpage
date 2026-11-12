import { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { SiteLayout } from './components/SiteLayout';
import { startSmoothScroll } from './utils/smoothScroll';

export default function App() {
  useEffect(() => startSmoothScroll(), []);

  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  );
}
