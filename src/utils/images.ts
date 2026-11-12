import { OPTIMIZED_IMAGES } from '../content/optimizedImages';

// Unmapped assets keep their original URL; optimized copies use content-hashed URLs.
export function getOptimizedImage(source: string) {
  return OPTIMIZED_IMAGES[source];
}
