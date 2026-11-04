import { Reveal, type RevealProps } from './Reveal';

export type FadeUpProps = Omit<RevealProps, 'variant' | 'distance'> & {
  // How far it rises from, in px
  y?: number;
};

// The original scroll-in: rises and fades in. A thin wrapper over Reveal, kept so existing pages don't change.
export function FadeUp({ y = 24, ...rest }: FadeUpProps) {
  return <Reveal variant="up" distance={y} {...rest} />;
}
