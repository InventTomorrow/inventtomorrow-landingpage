import { UserRound } from 'lucide-react';
import { SHOW_LINKEDIN_LINKS } from '../content/social';
import { TEAM_TIERS, type TeamMember } from '../content/team';
import { getOptimizedImage } from '../utils/images';
import { FadeUp } from './FadeUp';

// One portrait tile: photo (or a placeholder) with the name and role over a dark fade at the bottom.
function TeamCard({ member, delay }: { member: TeamMember; delay: number }) {
  const image = member.image ? getOptimizedImage(member.image) : undefined;
  return (
    <FadeUp delay={delay} y={16} className="min-w-0">
      <figure className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy-glow ring-1 ring-white/10">
        {member.image ? (
          <img
            src={image?.src ?? member.image}
            srcSet={image?.srcSet}
            sizes="(min-width: 32rem) 14rem, calc((100vw - 3.75rem) / 2)"
            alt={`${member.name}, ${member.role}`}
            width={image?.width ?? 800}
            height={image?.height ?? 1000}
            loading="eager"
            fetchPriority="low"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div role="img" aria-label={`${member.role} (photo to be added)`} className="flex h-full w-full items-center justify-center bg-white/5">
            <UserRound className="size-1/3 text-white/20" strokeWidth={1} aria-hidden="true" />
          </div>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" aria-hidden="true" />
        {SHOW_LINKEDIN_LINKS && member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn (opens in a new tab)`}
            title={`View ${member.name} on LinkedIn`}
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-primary/75 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors before:absolute before:-inset-1.5 before:rounded-full hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
            </svg>
          </a>
        )}
        <figcaption className="absolute inset-x-0 bottom-0 px-3 pb-4 text-center sm:pb-5">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-white sm:text-base">{member.name}</p>
          <p className="mt-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white/70 sm:text-xs">{member.role}</p>
        </figcaption>
      </figure>
    </FadeUp>
  );
}

// The team, shown by hierarchy: founder on top, then leadership, then the wider team. Edit src/content/team.ts.
export function TeamSection() {
  let index = 0;

  return (
    <section aria-labelledby="team-heading" className="relative z-10 w-full bg-navy-glow section-y px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-display text-sm font-medium uppercase text-accent">Our Team</p>
          <h2 id="team-heading" className="mt-2 font-display text-3xl font-semibold leading-tight tracking-display text-white sm:text-4xl">
            The people behind <span className="text-white/60">Invent Tomorrow</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
            Practical thinkers who combine technical skill and fresh ideas to build simple systems that work.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-8 md:mt-12">
          {TEAM_TIERS.map((tier) => (
            <div key={tier.label}>
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/50">{tier.label}</p>
              <div className={`mx-auto grid max-w-[29rem] grid-cols-2 gap-3 sm:gap-4 ${tier.members.length >= 4 ? 'lg:max-w-[59rem] lg:grid-cols-4' : ''}`}>
                {tier.members.map((member) => (
                  <TeamCard key={`${tier.label}-${member.role}`} member={member} delay={0.05 * (index++ % 3)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
