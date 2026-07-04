"use client";

import { TpJourneyTimeline } from "@/components/technology-profile/tp-journey-timeline";
import { TpTechnologyJourney } from "@/components/technology-profile/tp-technology-journey";
import type {
  TechnologyJourneyProgress,
  TechnologyJourneyScores,
} from "@/lib/technology-profile/types";
import type { JourneyTimelineEvent } from "@/lib/technology-profile/timeline";

type TechnologyJourneySectionProps = {
  clientId: string;
  journey: TechnologyJourneyProgress;
  journeyScores: TechnologyJourneyScores;
  journeyTimeline: JourneyTimelineEvent[];
};

/** Technology Journey workspace section (DOC-202 / DEV-002 Phase 1 Commit 6). */
export function TechnologyJourneySection({
  clientId,
  journey,
  journeyScores,
  journeyTimeline,
}: TechnologyJourneySectionProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <TpTechnologyJourney
        clientId={clientId}
        journey={journey}
        journeyScores={journeyScores}
        embedded
      />
      <TpJourneyTimeline
        clientId={clientId}
        events={journeyTimeline}
        assessmentsCompleted={journey.assessmentsCompleted}
        embedded
      />
    </div>
  );
}
