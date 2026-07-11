import "dotenv/config";
import { prisma } from "../src/lib/db";
import { assertDemoSeedAllowed } from "../prisma/demo/acme-foundation/constants";
import { seedAcmeFoundationDemo } from "../prisma/demo/acme-foundation/seed";

async function main() {
  assertDemoSeedAllowed();

  console.log("Resetting Acme Foundation demo dataset...");
  const result = await seedAcmeFoundationDemo(prisma);

  console.log("");
  console.log("Acme Foundation demo seed complete.");
  console.log(`Client ID: ${result.clientId}`);
  console.log(`Demo login email: ${result.demoEmail}`);
  console.log(`Baseline assessment: ${result.baselineAssessmentId}`);
  console.log(`Current assessment: ${result.currentAssessmentId}`);
  console.log("");
  console.log("Client routes:");
  console.log(`  /clients/${result.clientId}/technology-profile`);
  console.log(`  /clients/${result.clientId}/recommendations`);
  console.log(`  /clients/${result.clientId}/executive-reports`);
  console.log(`  /assessments/${result.currentAssessmentId}/report`);
  console.log(`  /api/v1/assessments/${result.currentAssessmentId}/export/pdf`);
  console.log("");
  console.log("Review guide: docs/review/ACME-FOUNDATION-CUSTOMER-PORTAL-REVIEW.md");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
