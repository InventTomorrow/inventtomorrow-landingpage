import { OPTIMIZED_IMAGES } from '../content/optimizedImages';
import { SERVICE_IMAGE_SOURCES } from '../content/serviceImages';

// Unmapped assets keep their original URL; optimized copies use content-hashed URLs.
export function getOptimizedImage(source: string) {
  return OPTIMIZED_IMAGES[source] ?? SERVICE_IMAGE_SOURCES[source];
}
