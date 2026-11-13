import { useAppReady } from '../hooks/useAppReady';
import { LoadingBrand } from './LoadingBrand';

// Optional full-screen loading state; share the same complete logo as route loading.
export function AppLoader() {
  const isReady = useAppReady();

  return isReady ? null : <LoadingBrand fullscreen />;
}
