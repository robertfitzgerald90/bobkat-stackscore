type WorkspaceSectionHeaderProps = {
  title: string;
  description?: string;
};

export function WorkspaceSectionHeader({ title, description }: WorkspaceSectionHeaderProps) {
  return (
    <div className="min-w-0 max-w-full">
      <h2 className="page-title">{title}</h2>
      {description ? (
        <p className="page-description mt-1">{description}</p>
      ) : null}
    </div>
  );
}
