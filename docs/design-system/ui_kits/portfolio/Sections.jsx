/* Porcelain portfolio — page sections, composed from the DS component library.
   Exports all sections to window (Babel scripts don't share scope). */
const NS = window.EdwynChenPorcelainDesignSystem_58116c;
const { Button, Logo, Eyebrow, Seal, WorkCard, MotifDivider, Blockquote, Badge, RevealImage } = NS;

/* --- shared ink-wash backdrop (stands in for hand-drawn ink illustration) --- */
function InkWash({ children, style }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 82% 15%, rgba(83,83,196,0.20), rgba(83,83,196,0) 55%)', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

function Nav({ onNav, onTalk }) {
  const items = ['Work', 'About', 'Approach', 'Journal', 'Contact'];
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(250,248,242,0.82)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-hairline)' }}>
      <nav style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '18px var(--gutter)', display: 'flex', alignItems: 'center', gap: 28 }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--blue-700)' }} aria-label="Edwyn Chen — home">
          <Logo variant={(window.__tw&&window.__tw.navLogo)||'mark'} size={30} />
        </a>
        <div style={{ display: 'flex', gap: 26, marginLeft: 8 }}>
          {items.map((it) => (
            <a key={it} href={'#' + it.toLowerCase()} onClick={(e) => { e.preventDefault(); onNav(it.toLowerCase()); }}
              style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', textDecoration: 'none' }}>{it}</a>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}><Button variant="secondary" size="sm" onClick={onTalk}>Let's talk</Button></div>
      </nav>
    </header>
  );
}

function Hero({ onNav }) {
  const tw = window.__tw || {};
  return (
    <InkWash style={{ background: 'var(--surface-page)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '90px var(--gutter) 70px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center' }}>
        <div>
          <Eyebrow>Digital Designer</Eyebrow>
          <h1 style={{ font: 'var(--type-h1)', margin: '18px 0 0', color: 'var(--text-primary)' }}>
            Design with <span style={{ color: 'var(--text-brand)', fontStyle: 'italic' }}>Clarity.</span><br />Crafted with Intention.
          </h1>
          <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', maxWidth: '42ch', margin: '22px 0 30px' }}>
            I design digital products and experiences that are elegant, usable, and meaningful.
          </p>
          <Button variant="secondary" arrow onClick={() => onNav('work')}>View Work</Button>
        </div>
        <div style={{ position: 'relative', minHeight: 360, display: 'grid', placeItems: 'center' }}>
          {/* Porcelain plate / ink-illustration placeholder */}
          <div style={{ position: 'relative', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #ffffff, #eeeffc 62%, #dbe4f3)', boxShadow: 'var(--shadow-float)', display: 'grid', placeItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', border: '1.5px solid var(--blue-200)' }} />
            <Logo variant={tw.heroMark || 'medallion'} size={120} color="var(--blue-500)" />
          </div>
          {tw.showCalligraphy !== false && (
          <div style={{ position: 'absolute', top: 8, right: 6, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-cjk)', color: 'var(--blue-400)', fontSize: 22, lineHeight: 1.6 }}>以简驭繁<br />匠心如一</div>
          </div>)}
          {tw.showSeal !== false && (
          <div style={{ position: 'absolute', bottom: 0, left: 0 }}><Seal characters="观然" size={54} /></div>)}
        </div>
      </div>
    </InkWash>
  );
}

const WORK = [
  { category: 'Fintech', title: 'Nimbus Banking', description: 'A next-generation banking experience for a digital-first world.' },
  { category: 'Wellness', title: 'Lumos Health', description: 'Personalized wellbeing companion for body and mind.' },
  { category: 'Cultural', title: 'Heritage Gallery', description: 'Bridging tradition and technology through digital storytelling.' },
  { category: 'AI / SaaS', title: 'Aster AI', description: 'An AI workspace for smarter insights and decisions.' },
];

function SelectedWork() {
  return (
    <section id="work" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '84px var(--gutter)' }}>
      <div style={{ marginBottom: 44 }}><MotifDivider label="Selected Work" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {WORK.map((w) => <WorkCard key={w.title} {...w} />)}
      </div>
    </section>
  );
}

function Gallery() {
  const tiles = [
    { t: 'Porcelain Tiles', c: 'Project Covers', tone: 'dark', span: 2, cjk: '青花' },
    { t: 'Porcelain Vases', c: 'Project Cover', tone: 'light', span: 1, cjk: '瓷' },
    { t: 'Blossom Study', c: 'Project Cover', tone: 'light', span: 1, cjk: '梅' },
    { t: 'Crane & Cloud', c: 'Project Cover', tone: 'dark', span: 1, cjk: '鹤' },
    { t: 'Lotus Plate', c: 'Project Cover', tone: 'light', span: 1, cjk: '莲' },
  ];
  return (
    <section id="journal" style={{ background: 'var(--surface-page)', borderTop: '1px solid var(--border-hairline)', borderBottom: '1px solid var(--border-hairline)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '84px var(--gutter)' }}>
        <Eyebrow tone="muted" rule>Graphic Design</Eyebrow>
        <h2 style={{ font: 'var(--type-h2)', color: 'var(--text-primary)', margin: '14px 0 34px' }}>A curated collection of visual stories.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {tiles.map((t, i) => (
            <div key={i} style={{ gridColumn: t.span === 2 ? 'span 2' : 'span 1' }}>
              <RevealImage ratio={t.span === 2 ? '2 / 1' : '4 / 3'} tone={t.tone} title={t.t} caption={t.c}>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: t.tone === 'dark' ? 'var(--blue-300)' : 'var(--blue-400)', fontFamily: 'var(--font-cjk)', fontSize: 56, opacity: 0.45 }}>{t.cjk}</div>
              </RevealImage>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const caps = ['Product Strategy', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research'];
  return (
    <section id="about" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '84px var(--gutter)', display: 'grid', gridTemplateColumns: '0.8fr 1fr 0.7fr', gap: 44, alignItems: 'start' }}>
      <div style={{ position: 'relative', aspectRatio: '3 / 4', borderRadius: 'var(--radius-image)', background: 'linear-gradient(160deg, #eeeffc, #dbe4f3)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <span style={{ fontFamily: 'var(--font-cjk)', fontSize: 88, color: 'var(--blue-300)', opacity: 0.6 }}>观</span>
        <div style={{ position: 'absolute', bottom: 12, right: 12 }}><Seal characters="然" size={40} /></div>
      </div>
      <div>
        <Eyebrow tone="muted" rule>About Me</Eyebrow>
        <h2 style={{ font: 'var(--type-h2)', color: 'var(--text-primary)', margin: '14px 0 18px' }}>I'm a digital designer based in Melbourne.</h2>
        <p style={{ font: 'var(--type-body-lg)', color: 'var(--text-secondary)', maxWidth: '46ch', margin: '0 0 26px' }}>
          I help startups and forward-thinking teams turn complex ideas into intuitive, beautiful products. My approach blends strategy, clarity, and craft to create experiences that truly connect.
        </p>
        <Button variant="ghost" arrow>More about me</Button>
      </div>
      <div id="approach">
        <Eyebrow tone="muted">Capabilities</Eyebrow>
        <ul style={{ listStyle: 'none', margin: '18px 0 0', padding: 0, display: 'grid', gap: 12 }}>
          {caps.map((c) => (
            <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-md)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-hairline)', paddingBottom: 12 }}>
              <span style={{ color: 'var(--blue-500)', display: 'inline-flex' }}><Logo variant="medallion" size={16} /></span>{c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ContactCTA({ onTalk }) {
  return (
    <section id="contact" style={{ padding: '10px var(--gutter) 90px', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
      <InkWash style={{ position: 'relative', borderRadius: 'var(--radius-card)', background: 'var(--surface-page)', border: '1.5px solid var(--border-default)', padding: '70px 40px', textAlign: 'center' }}>
        {['tl', 'tr', 'bl', 'br'].map((p) => {
          const map = { tl: { top: 14, left: 14, rot: 0 }, tr: { top: 14, right: 14, rot: 90 }, br: { bottom: 14, right: 14, rot: 180 }, bl: { bottom: 14, left: 14, rot: 270 } }[p];
          return <svg key={p} width="30" height="30" viewBox="0 0 26 26" fill="none" style={{ position: 'absolute', top: map.top, left: map.left, right: map.right, bottom: map.bottom, transform: `rotate(${map.rot}deg)`, color: 'var(--border-strong)' }}><path d="M1 12V1h11" stroke="currentColor" strokeWidth="1.5" /><circle cx="3.5" cy="3.5" r="1.3" fill="currentColor" /></svg>;
        })}
        <Eyebrow tone="muted" align="center">Let's create something meaningful</Eyebrow>
        <h2 style={{ font: 'var(--type-h2)', color: 'var(--text-primary)', margin: '18px 0 28px' }}>
          Have a project in mind?<br /><span style={{ fontStyle: 'italic' }}>I'd love to hear about it.</span>
        </h2>
        <Button variant="seal" size="lg" arrow onClick={onTalk}>Get in touch</Button>
      </InkWash>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'var(--surface-invert)', color: 'var(--text-on-invert)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '54px var(--gutter)', display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 36, alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--paper-50)', marginBottom: 14 }}><Logo variant="wordmark" size={26} color="var(--paper-50)" /></div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-invert-dim)', margin: 0 }}>© 2024 Edwyn Chen. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          {['Work', 'About', 'Journal', 'Contact'].map((l) => (
            <a key={l} href={'#' + l.toLowerCase()} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-invert-dim)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ justifySelf: 'end', maxWidth: 360 }}>
          <Blockquote tone="invert" size="sm" cite="Edwyn Chen">Good design is the bridge between culture and clarity.</Blockquote>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Hero, SelectedWork, Gallery, About, ContactCTA, Footer, InkWash });
