import fs from "fs";
import path from "path";

export type ProductCategory = "electronics" | "clothing" | "food" | "digital" | "services" | "other";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: ProductCategory;
  stock: number;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  buyerWallet: string;
  merchantWallet: string;
  status: "paid" | "pending";
  txSignature?: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data", "products");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(wallet: string): string {
  return path.join(DATA_DIR, `${wallet}.json`);
}

export function getProducts(wallet: string): Product[] {
  ensureDir();
  const fp = filePath(wallet);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

export function saveProduct(wallet: string, product: Product): Product[] {
  const products = getProducts(wallet);
  products.push(product);
  fs.writeFileSync(filePath(wallet), JSON.stringify(products, null, 2));
  return products;
}

export function deleteProduct(wallet: string, id: string): Product[] {
  const products = getProducts(wallet).filter((p) => p.id !== id);
  fs.writeFileSync(filePath(wallet), JSON.stringify(products, null, 2));
  return products;
}

export function updateProductStock(wallet: string, id: string, stock: number): Product[] {
  const products = getProducts(wallet);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return products;
  products[idx].stock = stock;
  fs.writeFileSync(filePath(wallet), JSON.stringify(products, null, 2));
  return products;
}
