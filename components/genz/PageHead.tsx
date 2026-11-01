// Haldi page banner used at the top of listing pages: big condensed title, Hindi line, a count chip,
// and the Madhubani triangle border underneath.
export function PageHead({ title, sub, meta, children }: { title: string; sub?: string; meta?: string; children?: React.ReactNode }) {
  return (
    <section className="gz-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 sm:pt-12">
        <h1 className="gz-h1" style={{ fontSize: "clamp(34px, 5.2vw, 64px)", lineHeight: 1 }}>{title}</h1>
        {sub && <p className="gz-kicker mt-3" lang="hi">{sub}</p>}
        {(meta || children) && (
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {meta && <span className="gz-chip">{meta}</span>}
            {children}
          </div>
        )}
      </div>
      <div className="gz-border" />
    </section>
  );
}
