import { legacyCardService } from "./src/lib/composition-root";

async function run(): Promise<void> {
  const userId = process.argv[2];
  if (!userId) throw new Error("Pass a legacy user id");
  const cards = await legacyCardService.list(userId);
  console.log("Legacy card count:", cards.length);
}
void run();
