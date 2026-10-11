import { Constellation } from "@/components/Constellation";
import { Counter } from "@/components/Counter";
import { Journey } from "@/components/Journey";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal>
      <p className="kicker">{kicker}</p>
      <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">{title}</h2>
    </Reveal>
  );
}

export default function Home() {
  const { hero, context, problem, roadmap, about, closing, candidate } = site;

  return (
    <main>
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <Constellation />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-8">
          <Reveal>
            <p className="kicker">{hero.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-7xl lg:text-8xl">
              {hero.title[0]}
              <br />
              <span className="bg-gradient-to-r from-accent to-signal bg-clip-text text-transparent">
                {hero.title[1]}
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-lg text-muted sm:text-xl">{hero.lede}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <a href="#context" className="mt-12 inline-flex items-center gap-3 text-sm text-muted hover:text-foreground">
              <span className="block h-10 w-px animate-pulse bg-accent" />
              {hero.cta}
            </a>
          </Reveal>
        </div>
      </section>

      <section id="context" className="mx-auto max-w-6xl px-4 py-32 sm:px-8">
        <SectionHeader kicker={context.kicker} title={context.title} />
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg text-muted">{context.body}</p>
        </Reveal>
        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {context.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="card p-6">
              <p className="font-display text-4xl text-accent sm:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-sm text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-32 sm:px-8">
        <SectionHeader kicker={problem.kicker} title={problem.title} />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {problem.points.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.1} className="card p-8">
              <p className="font-display text-2xl">{point.title}</p>
              <p className="mt-3 text-muted">{point.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Journey />

      <section className="mx-auto max-w-6xl px-4 py-32 sm:px-8">
        <SectionHeader kicker={roadmap.kicker} title={roadmap.title} />
        <ol className="relative mt-16 space-y-12 border-l border-line pl-8">
          {roadmap.phases.map((phase, i) => (
            <li key={phase.when} className="relative">
              <Reveal delay={i * 0.1}>
                <span className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full bg-accent shadow-[0_0_20px_var(--accent)]" />
                <p className="kicker">{phase.when}</p>
                <h3 className="mt-2 font-display text-3xl">{phase.title}</h3>
                <ul className="mt-4 space-y-2 text-muted">
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-32 sm:px-8">
        <SectionHeader kicker={about.kicker} title={about.title} />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {about.points.map((point, i) => (
            <li key={point} className="contents">
              <Reveal delay={i * 0.1} className="card p-8 text-muted">
                {point}
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <footer className="relative overflow-hidden border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-32 text-center sm:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-4xl sm:text-6xl">{closing.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href={`mailto:${candidate.email}`}
              className="mt-10 inline-flex rounded-full bg-accent px-8 py-4 font-medium text-background transition hover:bg-signal"
            >
              {closing.cta}
            </a>
          </Reveal>
          <div className="mt-16 flex justify-center gap-6 text-sm text-muted">
            <span>{candidate.name}</span>
            {candidate.links.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
