import { BrandLogoImage } from './BrandLogoImage';
import styles from './LoadingBrand.module.css';

export function LoadingBrand({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <div className={`${styles.loading} ${fullscreen ? styles.fullscreen : ''}`} role="status" aria-label="Loading Invent Tomorrow">
      <div className={styles.content}>
        <BrandLogoImage className={styles.logo} />
        <span className={styles.track} aria-hidden="true"><span /></span>
        <span className="sr-only">Loading, please wait.</span>
      </div>
    </div>
  );
}
