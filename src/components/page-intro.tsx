type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <section className="border-b border-navy/10 bg-ivory-deep/55">
      <div className="site-container grid gap-6 py-10 md:grid-cols-[1fr_auto] md:items-end md:py-14">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-navy md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-muted">{description}</p>
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}
