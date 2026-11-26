import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Code, Rocket, Briefcase, Users, Sparkle, ArrowRight, Check, List } from '@phosphor-icons/react'
import en from '../locales/en/common.json'
import ar from '../locales/ar/common.json'

type Lang = 'en' | 'ar'
type Dict = Record<string, string>
const dicts: Record<Lang, Dict> = { en: en as Dict, ar: ar as Dict }

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect() } }) },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={'reveal ' + className}>{children}</div>
}

function Tagline({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }) },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const words = text.split(' ')
  return (
    <p ref={ref} className={'heading-2 mx-auto max-w-[680px] text-center ' + (on ? 'tagline-on' : '')}>
      {words.map((w, i) => (
        <span key={i} className="tagline-word" style={{ transitionDelay: on ? (i * 70) + 'ms' : '0ms' }}>{w} </span>
      ))}
    </p>
  )
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block text-start">
      <span className="body-5 block mb-2">{label}</span>
      {children}
      {error ? <span className="caption-2 mt-2 block text-red-500">{error}</span> : null}
    </label>
  )
}

const inputCls = 'w-full rounded-xl border px-3 py-2 text-base focus:outline-none'
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' } as CSSProperties


function Demo({ t }: { t: (k: string) => string; lang: Lang }) {
  const [phase, setPhase] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [track, setTrack] = useState('fullstack')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const phases = [1, 2, 3].map((i) => ({
    title: t('demo.phase' + i + '.title'),
    weeks: t('demo.phase' + i + '.weeks'),
    topics: [1, 2, 3, 4].map((j) => t('demo.phase' + i + '.t' + j)),
  }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('demo.errRequired')
    if (!email.trim()) errs.email = t('demo.errRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t('demo.errEmail')
    setErrors(errs)
    if (Object.keys(errs).length === 0) setDone(true)
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('demo.curriculumLabel')}>
          {phases.map((p, i) => (
            <button key={p.title} type="button" role="tab" aria-selected={phase === i + 1} onClick={() => setPhase(i + 1)} className={'chip button-sm ' + (phase === i + 1 ? 'chip-on' : '')}>{p.title}</button>
          ))}
        </div>
        <div className="mt-8">
          <p className="caption-4" style={{ color: 'var(--muted)' }}>{phases[phase - 1].weeks}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {phases[phase - 1].topics.map((topic) => (
              <li key={topic} className="body-5 flex items-start gap-2"><Check size={18} className="mt-1 shrink-0" style={{ color: 'var(--accent)' }} />{topic}</li>
            ))}
          </ul>
          <p className="caption-2 mt-6" style={{ color: 'var(--muted)' }}>{t('demo.projectNote')}</p>
        </div>
      </div>
      <div className="card p-6 sm:p-8">
        <h3 className="title-1">{t('demo.enrollTitle')}</h3>
        <p className="body-6 mt-2" style={{ color: 'var(--muted)' }}>{t('demo.enrollSub')}</p>
        {done ? (
          <p className="body-1 mt-6 flex items-center gap-2" style={{ color: 'var(--accent)' }}><Check size={20} /> {t('demo.enrollSuccess')}</p>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('demo.name')} error={errors.name}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('demo.namePlaceholder')} className={inputCls} style={inputStyle} />
            </Field>
            <Field label={t('demo.email')} error={errors.email}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('demo.emailPlaceholder')} className={inputCls} style={inputStyle} />
            </Field>
            <Field label={t('demo.track')}>
              <select value={track} onChange={(e) => setTrack(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="fullstack">{t('demo.trackFullstack')}</option>
                <option value="frontend">{t('demo.trackFrontend')}</option>
                <option value="backend">{t('demo.trackBackend')}</option>
              </select>
            </Field>
            <div className="flex items-end">
              <button type="submit" className="btn-primary button-md w-full sm:w-auto">{t('demo.enrollSubmit')}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try { const s = localStorage.getItem('studio-lang'); return s === 'ar' ? 'ar' : 'en' } catch { return 'en' }
  })
  const dict = dicts[lang]
  const t = (k: string) => dict[k] ?? (en as Dict)[k] ?? k
  const rtl = lang === 'ar'
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailDone, setEmailDone] = useState(false)
  const [cookie, setCookie] = useState<string | null>(() => {
    try { return localStorage.getItem('studio-cookie') } catch { return null }
  })
  const [legal, setLegal] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    try { localStorage.setItem('studio-lang', lang) } catch { /* storage unavailable */ }
  }, [lang, rtl])

  useEffect(() => {
    const check = () => setNotFound(window.location.hash === '#404')
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
  }, [])

  const switchLang = (l: Lang) => { setLang(l); setMenuOpen(false) }
  const acceptCookie = (v: string) => { setCookie(v); try { localStorage.setItem('studio-cookie', v) } catch { /* ignore */ } }

  const submitEmail = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setEmailError(t('cta.errRequired')); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError(t('cta.errEmail')); return }
    setEmailError('')
    setEmailDone(true)
  }

  const navLinks = useMemo(() => [
    { href: '#features', label: t('nav.features') },
    { href: '#how', label: t('nav.how') },
    { href: '#demo', label: t('nav.demo') },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
  ], [lang])

  const benefits = [
    { icon: Code, title: t('b1.t'), text: t('b1.d') },
    { icon: Rocket, title: t('b2.t'), text: t('b2.d') },
    { icon: Briefcase, title: t('b3.t'), text: t('b3.d') },
    { icon: Users, title: t('b4.t'), text: t('b4.d') },
  ]
  const steps = [
    { n: '1', title: t('s1.t'), text: t('s1.d') },
    { n: '2', title: t('s2.t'), text: t('s2.d') },
    { n: '3', title: t('s3.t'), text: t('s3.d') },
  ]
  const stories = [
    { text: t('q1.text'), name: t('q1.name'), role: t('q1.role') },
    { text: t('q2.text'), name: t('q2.name'), role: t('q2.role') },
    { text: t('q3.text'), name: t('q3.name'), role: t('q3.role') },
  ]
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ q: t('f' + i + '.q'), a: t('f' + i + '.a') }))
  const tiers = [1, 2, 3].map((i) => ({
    name: t('tier' + i + '.name'), desc: t('tier' + i + '.desc'), price: t('tier' + i + '.price'),
    f: [t('tier' + i + '.f1'), t('tier' + i + '.f2'), t('tier' + i + '.f3')],
    badge: i === 2 ? t('tier2.badge') : '',
  }))

  if (notFound) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[680px] flex-col items-center justify-center px-4 text-center">
        <p className="heading-1">{t('nf.title')}</p>
        <p className="body-3 mt-4" style={{ color: 'var(--muted)' }}>{t('nf.body')}</p>
        <a href="#top" onClick={() => { window.location.hash = ''; setNotFound(false) }} className="btn-primary button-md mt-8">{t('nf.back')}</a>
      </div>
    )
  }

  return (
    <div id="top" className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-3 focus:py-2" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}>{t('skip')}</a>

      <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        <nav aria-label="Main" className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl border px-4 py-2 backdrop-blur-md" style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--surface) 88%, transparent)' }}>
          <a href="#top" className="title-1 font-semibold" aria-current="page">{t('brand')}</a>
          <ul className="hidden items-center gap-6 lg:flex">
            {navLinks.map((l) => (
              <li key={l.href}><a href={l.href} className="body-5 hover:opacity-70">{l.label}</a></li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border p-1" style={{ borderColor: 'var(--border)' }} role="group" aria-label={t('lang.label')}>
              <button type="button" onClick={() => switchLang('en')} aria-pressed={lang === 'en'} className={'button-sm rounded-lg px-3 py-2 ' + (lang === 'en' ? 'btn-primary' : '')}>EN</button>
              <button type="button" onClick={() => switchLang('ar')} aria-pressed={lang === 'ar'} className={'button-sm rounded-lg px-3 py-2 ' + (lang === 'ar' ? 'btn-primary' : '')}>عربي</button>
            </div>
            <a href="#signup" className="btn-primary button-sm hidden sm:inline-flex">{t('nav.cta')}</a>
            <button type="button" className="btn-ghost button-sm lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? t('nav.close') : t('nav.menu')}>
              <List size={20} />
            </button>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div className="menu-open fixed inset-0 z-30 flex flex-col px-8 pt-24" style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 96%, transparent)', backdropFilter: 'blur(16px)' }}>
          <ul className="flex flex-col gap-4">
            {navLinks.map((l, i) => (
              <li key={l.href} className="menu-link" style={{ transitionDelay: (i * 60) + 'ms' }}>
                <a href={l.href} onClick={() => setMenuOpen(false)} className="heading-4 block py-2">{l.label}</a>
              </li>
            ))}
            <li className="menu-link" style={{ transitionDelay: '300ms' }}>
              <a href="#signup" onClick={() => setMenuOpen(false)} className="btn-primary button-md mt-4">{t('nav.cta')}</a>
            </li>
          </ul>
        </div>
      ) : null}

      <main id="main">
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:pt-40">
          <div className="mx-auto max-w-[680px] text-center">
            <p className="caption-4 mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-2" style={{ borderColor: 'var(--border)' }}>
              <Sparkle size={16} style={{ color: 'var(--accent)' }} /> {t('hero.eyebrow')}
            </p>
            <h1 className="heading-1 hero-gradient mt-6">{t('hero.title')}</h1>
            <p className="body-2 mx-auto mt-6 max-w-[680px]" style={{ color: 'var(--muted)' }}>{t('hero.sub')}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#signup" className="btn-primary button-md w-full sm:w-auto">{t('hero.cta')} <ArrowRight size={18} /></a>
              <a href="#demo" className="btn-ghost button-md w-full sm:w-auto">{t('hero.secondary')}</a>
            </div>
            <p className="caption-2 mt-6 flex items-center justify-center gap-2" style={{ color: 'var(--muted)' }}>
              <Check size={16} style={{ color: 'var(--accent)' }} /> {t('hero.proof')}
            </p>
          </div>

          <Reveal className="mx-auto mt-16 max-w-3xl">
            <div className="card p-6 sm:p-8" role="img" aria-label={t('hero.alt')}>
              <div className="flex items-center justify-between gap-4">
                <p className="title-2">{t('hero.visualTitle')}</p>
                <span className="caption-4 rounded-full px-3 py-2" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}>{t('hero.visualBadge')}</span>
              </div>
              <p className="body-6 mt-2" style={{ color: 'var(--muted)' }}>{t('hero.visualSub')}</p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <p className="caption-4" style={{ color: 'var(--muted)' }}>{t('hero.stat' + i + 'label')}</p>
                    <p className="heading-4 mt-2">{t('hero.stat' + i + 'value')}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-end gap-2" aria-hidden="true">
                {[38, 52, 44, 66, 58, 74, 82].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-lg" style={{ height: h + 'px', backgroundColor: 'var(--accent)', opacity: 0.35 + i * 0.09 }} />
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="heading-2 text-center">{t('benefits.title')}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-center" style={{ color: 'var(--muted)' }}>{t('benefits.sub')}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <Reveal key={b.title}>
                  <article className="card h-full p-6">
                    <span className="inline-flex rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}><Icon size={24} /></span>
                    <h3 className="title-1 mt-4">{b.title}</h3>
                    <p className="body-3 mt-2" style={{ color: 'var(--muted)' }}>{b.text}</p>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <Tagline text={t('tagline')} />
          </Reveal>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="heading-2 text-center">{t('how.title')}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-center" style={{ color: 'var(--muted)' }}>{t('how.sub')}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <Reveal key={s.n}>
                <article className="card h-full p-6">
                  <span className="heading-3 inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}>{s.n}</span>
                  <h3 className="title-1 mt-4">{s.title}</h3>
                  <p className="body-3 mt-2" style={{ color: 'var(--muted)' }}>{s.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="heading-2 text-center">{t('demo.title')}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-center" style={{ color: 'var(--muted)' }}>{t('demo.sub')}</p>
          </Reveal>
          <Reveal className="mt-12">
            <Demo t={t} lang={lang} />
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="heading-2 text-center">{t('proof.title')}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-center" style={{ color: 'var(--muted)' }}>{t('proof.sub')}</p>
            <p className="caption-4 mt-4 text-center" style={{ color: 'var(--muted)' }}>{t('sample.label')}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {stories.map((s) => (
              <Reveal key={s.name}>
                <article className="card h-full p-6">
                  <p className="body-3">{s.text}</p>
                  <p className="body-1 mt-6">{s.name}</p>
                  <p className="caption-2" style={{ color: 'var(--muted)' }}>{s.role}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="heading-2 text-center">{t('pricing.title')}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-center" style={{ color: 'var(--muted)' }}>{t('pricing.sub')}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <Reveal key={tier.name}>
                <article className="card flex h-full flex-col p-6" style={tier.badge ? { borderColor: 'var(--accent)', borderWidth: '2px' } : undefined}>
                  {tier.badge ? <span className="caption-4 self-start rounded-full px-3 py-2" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}>{tier.badge}</span> : null}
                  <h3 className="title-1 mt-4">{tier.name}</h3>
                  <p className="body-6 mt-2" style={{ color: 'var(--muted)' }}>{tier.desc}</p>
                  <p className="heading-3 mt-6">{tier.price}</p>
                  <ul className="mt-6 flex flex-col gap-2">
                    {tier.f.map((f) => (
                      <li key={f} className="body-5 flex items-start gap-2"><Check size={18} className="mt-1 shrink-0" style={{ color: 'var(--accent)' }} />{f}</li>
                    ))}
                  </ul>
                  <a href="#signup" className="btn-primary button-md mt-8 w-full">{t('pricing.cta')}</a>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="caption-2 mt-6 text-center" style={{ color: 'var(--muted)' }}>{t('pricing.note')}</p>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
          <Reveal>
            <h2 className="heading-2 text-center">{t('faq.title')}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-center" style={{ color: 'var(--muted)' }}>{t('faq.sub')}</p>
          </Reveal>
          <div className="mt-12 flex flex-col gap-4">
            {faqs.map((f, i) => (
              <Reveal key={f.q}>
                <div className="card overflow-hidden">
                  <button type="button" className="flex w-full items-center justify-between gap-4 p-6 text-start" onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}>
                    <span className="title-2">{f.q}</span>
                    <span className="shrink-0 transition-transform duration-500" style={{ transform: faqOpen === i ? 'rotate(45deg)' : 'none', transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>+</span>
                  </button>
                  {faqOpen === i ? <p className="body-3 px-6 pb-6" style={{ color: 'var(--muted)' }}>{f.a}</p> : null}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="signup" className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <div className="card mx-auto max-w-3xl p-8 text-center sm:p-12" style={{ backgroundColor: 'var(--surface-2)' }}>
              <h2 className="heading-2">{t('cta.title')}</h2>
              <p className="body-3 mx-auto mt-4 max-w-[680px]" style={{ color: 'var(--muted)' }}>{t('cta.sub')}</p>
              {emailDone ? (
                <p className="body-1 mt-8 flex items-center justify-center gap-2" style={{ color: 'var(--accent)' }}><Check size={20} /> {t('cta.success')}</p>
              ) : (
                <form onSubmit={submitEmail} noValidate className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row">
                  <label htmlFor="cta-email" className="sr-only">{t('cta.email')}</label>
                  <input id="cta-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('cta.placeholder')} className={inputCls} style={inputStyle} />
                  <button type="submit" className="btn-primary button-md shrink-0">{t('cta.submit')}</button>
                </form>
              )}
              {emailError ? <p className="caption-2 mt-4 text-red-500">{emailError}</p> : null}
              <p className="caption-2 mt-4" style={{ color: 'var(--muted)' }}>{t('cta.note')}</p>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t px-4 py-16" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="title-1 font-semibold">{t('brand')}</p>
            <p className="body-6 mt-4 max-w-xs" style={{ color: 'var(--muted)' }}>{t('footer.about')}</p>
          </div>
          <nav aria-label="Footer">
            <p className="body-1">{t('footer.product')}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {navLinks.map((l) => (<li key={l.href}><a href={l.href} className="body-6 hover:opacity-70">{l.label}</a></li>))}
            </ul>
          </nav>
          <div>
            <p className="body-1">{t('footer.legal')}</p>
            <ul className="mt-4 flex flex-col gap-2">
              <li><button type="button" className="body-6 hover:opacity-70" onClick={() => setLegal('privacy')}>{t('footer.privacy')}</button></li>
              <li><button type="button" className="body-6 hover:opacity-70" onClick={() => setLegal('terms')}>{t('footer.terms')}</button></li>
              <li><button type="button" className="body-6 hover:opacity-70" onClick={() => setLegal('cookies')}>{t('footer.cookies')}</button></li>
              <li><a href="#404" className="body-6 hover:opacity-70">{t('footer.notfound')}</a></li>
            </ul>
          </div>
        </div>
        <p className="caption-2 mx-auto mt-12 max-w-6xl text-center" style={{ color: 'var(--muted)' }}>{t('footer.rights')}</p>
      </footer>

      {legal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t('legal.' + legal + '.title')} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setLegal(null)}>
          <div className="card max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="heading-4">{t('legal.' + legal + '.title')}</h2>
            <p className="body-3 mt-4" style={{ color: 'var(--muted)' }}>{t('legal.' + legal + '.body')}</p>
            <button type="button" className="btn-primary button-md mt-8" onClick={() => setLegal(null)}>{t('legal.close')}</button>
          </div>
        </div>
      ) : null}

      {!cookie ? (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl">
          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="body-6">{t('cookie.text')}</p>
            <div className="flex shrink-0 gap-2">
              <button type="button" className="btn-primary button-sm" onClick={() => acceptCookie('accepted')}>{t('cookie.accept')}</button>
              <button type="button" className="btn-ghost button-sm" onClick={() => acceptCookie('declined')}>{t('cookie.decline')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
