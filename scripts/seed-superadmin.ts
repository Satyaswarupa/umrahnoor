import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const envLocalPath = resolve(__dirname, "../.env.local");
config({ path: existsSync(envLocalPath) ? envLocalPath : resolve(__dirname, "../.env") });

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set (in .env.local).");
    process.exit(1);
  }

  const { connectToDatabase } = await import("../lib/mongodb");
  const { User } = await import("../models/User");
  const { hashPassword } = await import("../lib/auth");

  await connectToDatabase();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== "SUPERADMIN") {
      console.log(`A user with email ${email} already exists with role ${existing.role}.`);
      console.log("Refusing to overwrite an existing account. Update its role manually if intended.");
    } else {
      console.log(`Superadmin ${email} already exists. Nothing to do.`);
    }
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);

  await User.create({
    name: "Superadmin",
    email: email.toLowerCase(),
    passwordHash,
    role: "SUPERADMIN",
  });

  console.log(`Superadmin account created for ${email}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to seed superadmin:", error);
  process.exit(1);
});
