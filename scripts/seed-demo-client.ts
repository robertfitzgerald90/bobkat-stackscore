import "dotenv/config";
import { prisma } from "../src/lib/db";
import { assertDemoSeedAllowed } from "../prisma/demo/acme-foundation/constants";
import { seedAcmeFoundationDemo } from "../prisma/demo/acme-foundation/seed";

async function main() {
  assertDemoSeedAllowed();

  console.log("Resetting Pinnacle Engineering demo dataset...");
  const result = await seedAcmeFoundationDemo(prisma);

  console.log("");
  console.log("Pinnacle Engineering demo seed complete.");
  console.log(`Client: ${result.companyName}`);
  console.log(`Client ID: ${result.clientId}`);
  console.log(`Demo login email: ${result.demoEmail}`);
  console.log(`Demo login password: ${process.env.DEMO_CLIENT_PASSWORD ?? "PinnacleDemo2026!"}`);
  console.log(`Baseline assessment: ${result.baselineAssessmentId}`);
  console.log(`Current assessment: ${result.currentAssessmentId}`);
  console.log("");
  console.log("Staff routes:");
  console.log(`  /clients/${result.clientId}/technology-profile`);
  console.log(`  /clients/${result.clientId}/vcio`);
  console.log(`  /clients/${result.clientId}/billing`);
  console.log(`  /clients/${result.clientId}/billing/invoices`);
  console.log(`  /clients/${result.clientId}/improvement-plan/${result.tipId}`);
  console.log(`  /clients/${result.clientId}/recommendations`);
  console.log(`  /clients/${result.clientId}/projects`);
  console.log(`  /clients/${result.clientId}/quarterly-review/${result.qbrId}`);
  console.log("");
  console.log("Client portal login: use demo email/password above");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
