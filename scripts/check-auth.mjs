import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db/index.ts";

const email = process.argv[2] ?? "admin@bobkatit.com";
const password = process.argv[3] ?? "ChangeMe123!";

try {
  console.log("AUTH_SECRET set:", Boolean(process.env.AUTH_SECRET));
  console.log("AUTH_SECRET length:", process.env.AUTH_SECRET?.length ?? 0);
  console.log("AUTH_URL:", process.env.AUTH_URL ?? "(unset)");
  console.log("DATABASE_URL set:", Boolean(process.env.DATABASE_URL));

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  console.log("User found:", Boolean(user));
  if (!user) {
    const count = await prisma.user.count();
    console.log("Total users in DB:", count);
    process.exit(1);
  }

  console.log("isActive:", user.isActive);
  console.log("role:", user.role);
  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log("Password valid:", valid);
} catch (error) {
  console.error("Auth check failed:", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
