import { PrismaClient } from "@/lib/generated/prisma";
import sampleData from "./sample-data";

async function main() {
  const prisma = new PrismaClient();
  prisma.product.deleteMany();

  await prisma.product.createMany({ data: sampleData.products });
  console.log("database seeded successfully");
}

main();
