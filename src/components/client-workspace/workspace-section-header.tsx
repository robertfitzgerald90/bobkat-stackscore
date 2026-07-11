type WorkspaceSectionHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function WorkspaceSectionHeader({ title, description, actions }: WorkspaceSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-full">
        <h2 className="page-title">{title}</h2>
        {description ? (
          <p className="page-description mt-1">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
