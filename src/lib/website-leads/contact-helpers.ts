export function buildWebsiteLeadMailtoUrl(input: {
  email: string;
  name: string;
  company?: string | null;
}): string {
  const subject = encodeURIComponent(`Bobkat IT — following up with ${input.name}`);
  const body = encodeURIComponent(
    `Hi ${input.name},\n\nThank you for reaching out to Bobkat IT.${input.company ? `\n\n${input.company}` : ""}\n\n`,
  );
  return `mailto:${input.email}?subject=${subject}&body=${body}`;
}
