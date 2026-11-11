import { useState } from 'react';
import type { Fix } from '../content/fixes';
import { FixScenePreview } from './FixScenePreview';
import { SiteImage } from './SiteImage';

// One fix as a wide card: photo on the left, icon, name, what it does and an example result on the right.
// Hovering or focusing the card slides the example text conversation over it, so the card never changes size.
export function ServiceDetailCard({ fix }: { fix: Fix }) {
  const Icon = fix.icon;
  // Changing the key restarts the conversation's animation each time the card is entered.
  const [playCount, setPlayCount] = useState(0);
  const replay = () => setPlayCount((count) => count + 1);

  return (
    <article
      tabIndex={0}
      onMouseEnter={replay}
      onFocus={replay}
      className="group relative flex h-full min-h-[22.5rem] flex-col gap-6 overflow-hidden rounded-2xl border border-border bg-paper p-5 transition-colors duration-300 hover:border-accent focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-row sm:p-7"
    >
      <div className="aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:w-[38%] sm:max-w-[15.5rem]">
        <SiteImage
          src={fix.image.src}
          alt={fix.image.alt}
          label={fix.title}
          width={800}
          height={865}
          className="h-full! rounded-xl bg-white object-contain!"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Icon className="h-12 w-12 text-accent" strokeWidth={1.25} aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-semibold text-primary">{fix.title}</h3>
        <p className="mt-3 text-base">{fix.text}</p>
        <p className="mt-auto pt-6 text-sm font-medium text-primary">
          <span className="text-accent">Example: </span>
          {fix.scene.result}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex translate-y-full items-center justify-center bg-hero-soft p-5 transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 motion-reduce:translate-y-0 motion-reduce:opacity-0 motion-reduce:transition-opacity motion-reduce:group-focus-within:opacity-100 motion-reduce:group-hover:opacity-100"
      >
        <FixScenePreview key={playCount} fix={fix} />
      </div>
    </article>
  );
}
