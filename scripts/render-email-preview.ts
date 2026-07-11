import "dotenv/config";
import { writeFileSync } from "node:fs";
import { buildActivationEmail } from "../src/lib/email/templates/assessment-purchase";

async function main() {
  const sample = await buildActivationEmail({
    activationUrl: "https://app.example.com/activate-account?token=preview-sample-token",
  });

  writeFileSync("tmp-email-preview.html", sample.html, "utf8");
  writeFileSync("tmp-email-preview.txt", sample.text, "utf8");

  console.log("Subject:", sample.subject);
  console.log("\n--- Plain text preview ---\n");
  console.log(sample.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
