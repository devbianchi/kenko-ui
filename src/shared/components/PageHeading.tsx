export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
      <p className="mt-1 text-base text-text-muted sm:text-lg">{description}</p>
    </div>
  )
}
