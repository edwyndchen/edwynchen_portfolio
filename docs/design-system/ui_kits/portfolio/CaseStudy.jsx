/* Case-study article body for the Edwyn Chen porcelain portfolio.
   Reuses design-system components; exports CaseStudy to window. */
const CS_NS = window.EdwynChenPorcelainDesignSystem_58116c;
const { Button, Logo, Eyebrow, Seal, Badge, MotifDivider, Blockquote, WorkCard } = CS_NS;

const WRAP = { maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--gutter)' };
const MEASURE = 720;

function Meta({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-semibold)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/* A titled prose block. `eyebrow` is the section marker, `title` the heading.
   Layout follows the `bodyLayout` tweak: 'split' = title left / content right. */
function Block({ eyebrow, title, children, seal }) {
  const split = (window.__cstw || {}).bodyLayout !== 'stacked';
  const marker = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Eyebrow tone="brand" rule>{eyebrow}</Eyebrow>
      {seal && <Seal characters={seal} size={40} />}
    </div>
  );
  const heading = <h2 style={{ font: 'var(--type-h2)', color: 'var(--text-primary)', margin: '0 0 18px' }}>{title}</h2>;
  const body = <div style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', display: 'grid', gap: 18 }}>{children}</div>;
  if (split) {
    return (
      <section style={{ ...WRAP, marginTop: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) minmax(0,2fr)', gap: 48, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 92 }}>{marker}</div>
          <div>{heading}{body}</div>
        </div>
      </section>
    );
  }
  return (
    <section style={{ ...WRAP, marginTop: 64 }}>
      <div style={{ maxWidth: MEASURE, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>{marker}</div>
        {heading}{body}
      </div>
    </section>
  );
}

function StatList({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginTop: 4 }}>
      {items.map((s) => (
        <div key={s.label} style={{ padding: '22px 0', borderTop: '1.5px solid var(--border-default)' }}>
          <div style={{ font: 'var(--type-h2)', color: 'var(--text-brand)', lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 10 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 12, alignItems: 'start' }}>
          <span style={{ fontFamily: 'var(--font-cjk)', color: 'var(--text-brand)', fontSize: 18, lineHeight: 1.4 }}>•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ProcessSteps({ steps }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 26 }}>
      {steps.map((st, i) => (
        <li key={i} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--text-brand)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</div>
          <div>
            <h3 style={{ font: 'var(--type-h4)', color: 'var(--text-primary)', margin: '0 0 6px' }}>{st.title}</h3>
            <p style={{ font: 'var(--type-body)', color: 'var(--text-secondary)', margin: 0 }}>{st.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CaseStudy() {
  const headMax = (window.__cstw || {}).headerWidth === 'measure' ? MEASURE : '100%';
  return (
    <article style={{ paddingBottom: 40 }}>
      {/* ---- Header ---- */}
      <header style={{ ...WRAP, paddingTop: 64, paddingBottom: 8 }}>
        <div style={{ maxWidth: headMax, margin: '0 auto' }}>
          <a href="index.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 26 }}>
            <span style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true"><path d="M2 12h13.622" /><path d="M14.056 17.296 22 12l-7.944-5.296L15.822 12l-1.766 5.296Z" /></svg>
            </span>
            Back to work
          </a>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            <Badge tone="cobalt" variant="tag">Fintech</Badge>
            <Badge tone="cobalt" variant="tag">Product Design</Badge>
            <Badge tone="seal" variant="tag">iOS</Badge>
            <Badge tone="cobalt" variant="tag">Design System</Badge>
          </div>
          <h1 style={{ font: 'var(--type-h1)', color: 'var(--text-primary)', margin: '0 0 18px' }}>
            Nimbus Banking — a <span style={{ color: 'var(--text-brand)', fontStyle: 'italic' }}>calmer</span> way to bank.
          </h1>
          <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', maxWidth: '54ch', margin: 0 }}>
            Reimagining a digital-first bank around clarity and trust — from first principles to a shipped iOS product used by over 40,000 people.
          </p>
        </div>
      </header>

      {/* ---- Meta strip ---- */}
      <div style={{ ...WRAP, marginTop: 34 }}>
        <div style={{ maxWidth: headMax, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, padding: '24px 0', borderTop: '1.5px solid var(--border-default)', borderBottom: '1.5px solid var(--border-default)' }}>
          <Meta label="Role">Lead Product Designer</Meta>
          <Meta label="Timeline">2023 — 2024 · 7 months</Meta>
          <Meta label="Team">3 designers · 6 engineers</Meta>
        </div>
      </div>

      {/* ---- Cover ---- */}
      <div style={{ ...WRAP, marginTop: 34 }}>
        {(() => {
          const tw = window.__cstw || {};
          const mark = tw.coverMark || 'none';
          return (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'radial-gradient(circle at 34% 28%, #ffffff, #eef2f9 60%, #dbe4f3)', boxShadow: 'var(--shadow-float)', display: 'grid', placeItems: 'center' }}>
              {tw.coverBorder && <div style={{ position: 'absolute', inset: 18, borderRadius: 'calc(var(--radius-card) - 8px)', border: '1.5px solid var(--blue-200)', pointerEvents: 'none' }} />}
              {mark !== 'none'
                ? <Logo variant={mark} size={128} color="var(--blue-500)" />
                : <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blue-400)' }}>Cover image</span>}
              {tw.coverSeal && <div style={{ position: 'absolute', bottom: 18, right: 20 }}><Seal characters="观然" size={52} /></div>}
            </div>
          );
        })()}
      </div>

      {/* ---- Overview ---- */}
      <Block eyebrow="Project Overview" title="A bank that gets out of your way.">
        <p style={{ margin: 0 }}>Nimbus set out to build a mobile-first bank for people who find money stressful. The existing app had grown feature-heavy and noisy; core actions were buried and trust was eroding. We were asked to rebuild the experience around a single idea — <em>quiet confidence</em>.</p>
        <p style={{ margin: 0 }}>Over seven months I led design from research through shipped release, partnering closely with engineering and a small brand team to define both the product and the system beneath it.</p>
      </Block>

      {/* ---- Outcomes ---- */}
      <Block eyebrow="Outcomes" title="What changed.">
        <StatList items={[
          { value: '+38%', label: 'Weekly active users in the first quarter after launch' },
          { value: '4.8★', label: 'App Store rating, up from 3.6 pre-redesign' },
          { value: '−52%', label: 'Support tickets about navigation and lost actions' },
        ]} />
      </Block>

      {/* ---- Goals ---- */}
      <Block eyebrow="Goals" title="What we set out to do.">
        <Bullets items={[
          'Make the five most common tasks reachable in a single tap from home.',
          'Rebuild trust through transparent language, clear states, and honest empty screens.',
          'Ship a scalable design system so the team could move faster after launch.',
        ]} />
      </Block>

      {/* ---- My Role ---- */}
      <Block eyebrow="My Role" title="Where I focused.">
        <p style={{ margin: 0 }}>As lead designer I owned the end-to-end product design and facilitated the direction across the team. My work spanned discovery research, interaction and visual design, prototyping, and building the component library hand-in-hand with engineering.</p>
        <Bullets items={[
          'Research & synthesis — 18 user interviews, competitive teardown, journey mapping.',
          'Interaction & visual design for the full iOS app.',
          'Design system — tokens, components, and documentation.',
          'Design QA and handoff through to release.',
        ]} />
      </Block>

      {/* ---- Problem ---- */}
      <Block eyebrow="Problem" title="Noise, not clarity.">
        <p style={{ margin: 0 }}>Every team had added their feature to the home screen, and it showed. Users told us they felt anxious opening the app — they couldn't quickly answer the one question that mattered: <em>am I okay?</em></p>
        <Blockquote cite="Nimbus customer, research interview">I open it, I panic a little, and I close it. I never actually know where my money is.</Blockquote>
      </Block>

      {/* ---- Process ---- */}
      <Block eyebrow="Process" title="How we got there.">
        <ProcessSteps steps={[
          { title: 'Discovery', body: 'Interviews and diary studies surfaced the emotional core: people wanted reassurance before detail.' },
          { title: 'Framing', body: 'We reframed the home screen as a single answer — balance and safe-to-spend first, everything else on demand.' },
          { title: 'Prototyping', body: 'Rapid interactive prototypes tested navigation models and tone of voice with real customers.' },
          { title: 'System & ship', body: 'A token-driven component library let us design and build the final release in parallel.' },
        ]} />
      </Block>

      {/* ---- Learning ---- */}
      <Block eyebrow="Learning" title="What I took away.">
        <p style={{ margin: 0 }}>The hardest work was subtraction. Removing features felt risky, but each thing we took away made the rest more trustworthy. Designing for calm meant designing for restraint — and defending that restraint in every review.</p>
      </Block>

      {/* ---- Next Steps ---- */}
      <Block eyebrow="Next Steps" title="Where it goes next.">
        <Bullets items={[
          'Extend the system to Android and web dashboards.',
          'Introduce gentle, opt-in financial insights that keep the calm tone.',
          'Longitudinal study on trust and financial wellbeing six months post-launch.',
        ]} />
        <div style={{ marginTop: 12 }}>
          <Button variant="secondary" arrow onClick={() => { window.location.href = 'index.html'; }}>See more work</Button>
        </div>
      </Block>

      <section style={{ ...WRAP, marginTop: 84 }}>
        <div style={{ borderTop: '1.5px solid var(--border-default)', paddingTop: 40 }}>
          <div style={{ marginBottom: 26 }}><Eyebrow tone="brand" rule>More case studies</Eyebrow></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            <WorkCard href="case-study.html" category="Wellness" title="Lumos Health" description="A personalized wellbeing companion for body and mind." />
            <WorkCard href="case-study.html" category="Cultural" title="Heritage Gallery" description="Bridging tradition and technology through digital storytelling." framed={false} />
            <WorkCard href="case-study.html" category="AI / SaaS" title="Aster AI" description="An AI workspace for smarter insights and faster decisions." />
          </div>
        </div>
      </section>
    </article>
  );
}

Object.assign(window, { CaseStudy });
