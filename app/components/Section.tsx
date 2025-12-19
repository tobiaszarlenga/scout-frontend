export default function Section({
  title,
  description,
  children,
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-apptext">{title}</h1>
        {description && <p className="text-[rgba(var(--color-text-rgb),0.6)] text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}
