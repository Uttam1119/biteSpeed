import dotenv from "dotenv";
import app from "./app";
import prisma from "./db";

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function main() {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
