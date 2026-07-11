import type { PageContext } from "@/lib/command-center/types";

export function buildPageContext(input: {
  pathname: string;
  role: string;
  userClientId?: string | null;
}): PageContext {
  const pathname = input.pathname;

  const clientMatch = pathname.match(/^\/clients\/([^/]+)/);
  const clientId =
    clientMatch && clientMatch[1] !== "new" ? clientMatch[1] : null;

  const assessmentMatch = pathname.match(/^\/assessments\/([^/]+)/);
  const assessmentId =
    assessmentMatch && assessmentMatch[1] !== "start" ? assessmentMatch[1] : null;

  const technologyMatch = pathname.match(/^\/technology-catalog\/([^/]+)/);
  const technologySlug = technologyMatch?.[1] ?? null;

  const projectMatch = pathname.match(/^\/projects/);
  const projectId = projectMatch && pathname.includes("selected=")
    ? new URL(pathname, "https://stackscore.local").searchParams.get("selected")
    : null;

  const campaignMatch = pathname.match(
    /^\/admin\/communications\/campaigns\/([^/]+)/,
  );
  const campaignId =
    campaignMatch && campaignMatch[1] !== "new" ? campaignMatch[1] : null;

  const prospectMatch = pathname.match(
    /^\/admin\/communications\/prospects\/([^/]+)/,
  );
  const prospectId =
    prospectMatch && prospectMatch[1] !== "import" ? prospectMatch[1] : null;

  const templateMatch = pathname.match(
    /^\/admin\/communications\/templates\/([^/]+)/,
  );
  const templateKey = templateMatch?.[1] ?? null;

  return {
    pathname,
    role: input.role,
    userClientId: input.userClientId ?? null,
    clientId,
    assessmentId,
    technologySlug,
    projectId,
    campaignId,
    prospectId,
    templateKey,
  };
}

export function isClientWorkspaceContext(context: PageContext): boolean {
  return Boolean(context.clientId);
}

export function isAssessmentContext(context: PageContext): boolean {
  return Boolean(context.assessmentId);
}

export function isTechnologyContext(context: PageContext): boolean {
  return Boolean(context.technologySlug);
}
