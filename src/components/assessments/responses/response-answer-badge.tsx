import { Badge } from "@/components/ui/badge";
import {
  formatResponseAnswerLabel,
  getAnswerBadgeVariant,
  type AnswerBadgeVariant,
} from "@/lib/assessments/response-view";
import { cn } from "@/lib/utils";

type ResponseAnswerBadgeProps = {
  answerText: string | null | undefined;
  className?: string;
};

const VARIANT_CLASS: Record<AnswerBadgeVariant, string> = {
  success: "",
  warning: "",
  destructive: "",
  secondary: "",
  outline: "",
};

export function ResponseAnswerBadge({ answerText, className }: ResponseAnswerBadgeProps) {
  const label = formatResponseAnswerLabel(answerText);
  const variant = getAnswerBadgeVariant(answerText);

  return (
    <Badge
      variant={variant}
      className={cn(
        label === "No response provided" && "font-normal text-muted-foreground",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
