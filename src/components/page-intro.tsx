type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <section className="border-b border-navy/10 bg-ivory-deep/55">
      <div className="site-container grid gap-1.5 py-2 md:grid-cols-[1fr_auto] md:items-end md:py-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1 max-w-4xl text-2xl font-black tracking-tight text-navy sm:text-3xl md:text-2xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-ink-muted md:text-xs md:leading-5">{description}</p>
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}
