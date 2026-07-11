import { registerNavigationCommands } from "@/lib/command-center/modules/navigation";
import {
  registerCommunicationsCommands,
  registerContextualCommands,
} from "@/lib/command-center/modules/communications";
import { registerOrganizationCommands } from "@/lib/command-center/modules/organizations";
import { registerAssessmentCommands } from "@/lib/command-center/modules/assessments";
import { registerTechnologyCommands } from "@/lib/command-center/modules/technology";
import { registerProjectCommands } from "@/lib/command-center/modules/projects";
import { clearCommandRegistry } from "@/lib/command-center/registry";

let initialized = false;

/** Bootstrap all module command registrations (idempotent). */
export function initializeCommandModules(): void {
  if (initialized) return;
  clearCommandRegistry();
  registerNavigationCommands();
  registerCommunicationsCommands();
  registerOrganizationCommands();
  registerAssessmentCommands();
  registerTechnologyCommands();
  registerProjectCommands();
  registerContextualCommands();
  initialized = true;
}

export function resetCommandModulesForTests(): void {
  initialized = false;
  clearCommandRegistry();
}
