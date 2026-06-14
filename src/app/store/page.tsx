import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, Store as StoreIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface StoreInfo {
  wallet: string;
  productCount: number;
}

async function getStores(): Promise<StoreInfo[]> {
  const stores = await prisma.product.groupBy({
    by: ["wallet"],
    _count: { id: true },
  });
  return stores.map((store) => ({ wallet: store.wallet, productCount: store._count.id }));
}

export default async function StoreDirectoryPage() {
  const stores = await getStores();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="container px-6 py-4 max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo size={20} variant="word" /></Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft size={12} /> Home</Link>
        </div>
      </header>

      <main className="flex-1 container px-6 py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Stores</h1>
        <p className="text-sm text-muted-foreground mb-8">Browse stores accepting USDT on Solana.</p>

        {stores.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <StoreIcon size={40} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No stores yet</p>
            <Link href="/dashboard" className="text-primary text-sm font-medium hover:underline">Create your store</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((s) => (
              <Link
                key={s.wallet}
                href={`/store/${s.wallet}`}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <StoreIcon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.wallet.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">{s.productCount} product{s.productCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span className="text-xs text-primary font-medium group-hover:underline">Visit Store →</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/50">
        ChajiPay &mdash; Lipa Chaji Wako
      </footer>
    </div>
  );
}
