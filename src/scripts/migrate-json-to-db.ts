import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

async function main() {
  const productsDir = path.join(process.cwd(), "data", "products");
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir).filter((file) => file.endsWith(".json"));
    for (const file of files) {
      const wallet = file.replace(".json", "");
      const products = JSON.parse(fs.readFileSync(path.join(productsDir, file), "utf-8"));
      for (const product of products) {
        await prisma.product.upsert({
          where: { id: product.id },
          update: {
            wallet,
            name: product.name,
            price: product.price,
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            category: product.category || "other",
            stock: product.stock ?? 0,
          },
          create: {
            id: product.id,
            wallet,
            name: product.name,
            price: product.price,
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            category: product.category || "other",
            stock: product.stock ?? 0,
          },
        });
      }
    }
  }

  const storeDir = path.join(process.cwd(), "data", "store");
  if (fs.existsSync(storeDir)) {
    const files = fs.readdirSync(storeDir).filter((file) => file.endsWith(".json"));
    for (const file of files) {
      const wallet = file.replace(".json", "");
      const config = JSON.parse(fs.readFileSync(path.join(storeDir, file), "utf-8"));
      await prisma.storeConfig.upsert({
        where: { wallet },
        update: { receivingWallet: config.receivingWallet || wallet },
        create: { wallet, receivingWallet: config.receivingWallet || wallet },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Migrated JSON data to SQLite.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
