type WorkspaceSectionHeaderProps = {
  title: string;
  description?: string;
};

export function WorkspaceSectionHeader({ title, description }: WorkspaceSectionHeaderProps) {
  return (
    <div className="min-w-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
