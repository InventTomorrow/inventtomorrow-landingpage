import { CheckCircle2 } from 'lucide-react';
import { m } from 'motion/react';
import type { Fix } from '../content/fixes';

const MESSAGE_GAP = 0.4;
const SNAPPY_TRANSITION = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

// An example text conversation for one automation: the trigger, the messages, then the result.
export function FixScenePreview({ fix }: { fix: Fix }) {
  const { scene } = fix;
  const TriggerIcon = scene.triggerIcon;
  return (
    <div className="mx-auto w-full max-w-sm">
   <div className="overflow-hidden rounded-[1.75rem] border border-border bg-paper">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">BH</span>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-sm font-semibold text-primary">Bright Home Cleaning</p>
            <p className="text-xs text-body">Example conversation</p>
          </div>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">Automated</span>
        </div>

        <div className="space-y-3 bg-paper/60 px-5 py-5">
          <m.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SNAPPY_TRANSITION}
            className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-primary/[0.06] px-3 py-1 text-xs font-medium text-body"
          >
            <TriggerIcon className="h-3.5 w-3.5" />
            {scene.trigger}
          </m.div>

          {scene.messages.map((message, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...SNAPPY_TRANSITION, delay: 0.25 + i * MESSAGE_GAP }}
              className={`flex ${message.from === 'us' ? 'justify-end' : 'justify-start'}`}
            >
              <p
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                  message.from === 'us'
                    ? 'rounded-br-md bg-accent text-white'
                    : 'rounded-bl-md border border-border bg-paper text-primary'
                }`}
              >
                {message.text}
              </p>
            </m.div>
          ))}
        </div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SNAPPY_TRANSITION, delay: 0.25 + scene.messages.length * MESSAGE_GAP }}
        className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-sm font-semibold text-primary"
      >
        <CheckCircle2 className="h-4 w-4 text-accent" />
        {scene.result}
      </m.div>
    </div>
  );
}
