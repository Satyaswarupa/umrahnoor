import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const envLocalPath = resolve(__dirname, "../.env.local");
config({ path: existsSync(envLocalPath) ? envLocalPath : resolve(__dirname, "../.env") });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm run promote:superadmin -- <email>");
    process.exit(1);
  }

  const { connectToDatabase } = await import("../lib/mongodb");
  const { User } = await import("../models/User");

  await connectToDatabase();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`No user found with email ${email}. Sign up at /signup first.`);
    process.exit(1);
  }

  if (user.role === "SUPERADMIN") {
    console.log(`${email} is already a SUPERADMIN. Nothing to do.`);
    process.exit(0);
  }

  const previousRole = user.role;
  user.role = "SUPERADMIN";
  await user.save();

  console.log(`Updated ${email}: ${previousRole} -> SUPERADMIN`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to promote user:", error);
  process.exit(1);
});
