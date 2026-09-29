import { disconnectSeedPrisma, seedDatabase } from "../src/lib/seed-demo";

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectSeedPrisma();
  });
