import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfClosingHeroProps = {
  title: string;
  subtitle: string;
};

export function PdfClosingHero({ title, subtitle }: PdfClosingHeroProps) {
  return (
    <View style={styles.closingHero}>
      <Text style={styles.closingHeroTitle}>{title}</Text>
      <Text style={styles.closingHeroSubtitle}>{subtitle}</Text>
    </View>
  );
}

const JOURNEY_STEPS = ["Assess", "Improve", "Maintain"] as const;

type PdfJourneyClosingHeroProps = {
  title: string;
  subtitle: string;
  activePhaseLabel: string;
};

export function PdfJourneyClosingHero({
  title,
  subtitle,
  activePhaseLabel,
}: PdfJourneyClosingHeroProps) {
  return (
    <View style={styles.closingHero}>
      <Text style={styles.closingHeroTitle}>{title}</Text>
      <Text style={styles.closingHeroSubtitle}>{subtitle}</Text>
      <View style={styles.journeySteps}>
        {JOURNEY_STEPS.map((step) => (
          <View key={step} style={styles.journeyStep}>
            <View
              style={[
                styles.journeyStepDot,
                activePhaseLabel.toLowerCase().startsWith(step.toLowerCase().slice(0, 4))
                  ? styles.journeyStepDotActive
                  : {},
              ]}
            />
            <Text style={styles.journeyStepLabel}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
