"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Package, Search, ShieldCheck, ShoppingBag, Sparkles, Wallet } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

const CATEGORIES = ["all", "electronics", "clothing", "food", "digital", "services", "other"];

export default function Storefront({ params }: { params: { storeId: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const storeId = params.storeId;

  useEffect(() => {
    fetch(`/api/products?wallet=${storeId}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [storeId]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, selectedCategory]);

  const featured = filtered[0];
  const rest = featured ? filtered.slice(1) : filtered;
  const storeName = `Store ${storeId.slice(0, 4).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-700/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container px-6 py-4 max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg shadow-primary/10">
              <ShoppingBag size={18} className="text-white" />
            </div>
            {storeName}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/orders" className="text-xs text-muted-foreground hover:text-primary transition-colors">My Orders</Link>
            <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">ChajiPay</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 container px-6 py-8 max-w-6xl mx-auto w-full">
        <section className="rounded-[2rem] border border-border bg-card/80 backdrop-blur-xl overflow-hidden mb-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-0">
            <div className="p-7 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground mb-5">
                <Sparkles size={13} className="text-primary" /> Verified Solana storefront
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Shop with <span className="bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">USDT</span> on Solana.
              </h1>
              <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
                Browse products, pay directly to the merchant wallet, and verify every purchase on-chain.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2"><ShieldCheck size={13} className="text-primary" /> Non-custodial</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2"><Wallet size={13} className="text-primary" /> Binance / OKX / Phantom</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2"><CheckCircle2 size={13} className="text-primary" /> On-chain receipts</span>
              </div>
            </div>
            <div className="relative min-h-[280px] bg-gradient-to-br from-amber-300 via-amber-600 to-zinc-950 p-6 flex items-end">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_25%)]" />
              <div className="relative rounded-3xl bg-background/90 backdrop-blur p-5 w-full border border-white/10 shadow-2xl">
                <p className="text-xs text-muted-foreground">Products available</p>
                <p className="text-5xl font-black text-primary mt-1">{products.length}</p>
                <p className="text-xs text-muted-foreground mt-3 font-mono">{storeId.slice(0, 8)}...{storeId.slice(-8)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-[73px] z-30 bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-3 mb-8">
          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chargers, services, digital goods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-24 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Loading store...</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-[2rem]">
            <Package size={42} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold mb-1">{search || selectedCategory !== "all" ? "No matching products" : "No products found"}</h3>
            <p className="text-sm text-muted-foreground">{search || selectedCategory !== "all" ? "Try a different search or category." : "This store has no products yet."}</p>
          </div>
        ) : (
          <>
            {featured && (
              <section className="grid lg:grid-cols-[1.15fr_.85fr] gap-5 mb-6">
                <ProductImage product={featured} featured />
                <div className="rounded-[2rem] border border-border bg-card p-6 flex flex-col justify-center">
                  <span className="w-fit px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground capitalize">Featured {featured.category}</span>
                  <h2 className="mt-4 text-3xl font-black tracking-tight">{featured.name}</h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{featured.description || "Premium product available for direct USDT checkout."}</p>
                  <p className="mt-6 text-5xl font-black text-primary">{featured.price} <span className="text-base text-foreground">USDT</span></p>
                  <ProductButton product={featured} storeId={storeId} className="mt-7" />
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((product) => (
                <article key={product.id} className="bg-card border border-border rounded-[1.7rem] overflow-hidden hover:border-primary/60 transition-all group flex flex-col hover:shadow-xl hover:shadow-primary/5">
                  <ProductImage product={product} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground capitalize">{product.category}</span>
                        {product.stock <= 0 ? <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">Out of Stock</span> : <span className="text-[10px] text-muted-foreground">{product.stock} left</span>}
                      </div>
                      <h3 className="font-bold text-base line-clamp-1">{product.name}</h3>
                      <p className="text-2xl font-extrabold mt-1.5 text-primary">{product.price} <span className="text-xs text-muted-foreground font-medium">USDT</span></p>
                      <p className="text-muted-foreground mt-2 text-xs line-clamp-2">{product.description}</p>
                    </div>
                    <ProductButton product={product} storeId={storeId} className="mt-5" />
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      <footer className="relative z-10 py-5 text-center text-xs text-muted-foreground border-t border-border/50">
        Powered by ChajiPay &mdash; Lipa Chaji Wako
      </footer>
    </div>
  );
}

function ProductImage({ product, featured = false }: { product: Product; featured?: boolean }) {
  return product.imageUrl ? (
    <div className={`${featured ? "h-[420px] rounded-[2rem]" : "h-56"} bg-secondary/50 overflow-hidden`}>
      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
  ) : (
    <div className={`${featured ? "h-[420px] rounded-[2rem]" : "h-56"} bg-gradient-to-br from-secondary to-card flex items-center justify-center`}>
      <Package size={featured ? 64 : 40} className="text-muted-foreground/40" />
    </div>
  );
}

function ProductButton({ product, storeId, className = "" }: { product: Product; storeId: string; className?: string }) {
  return (
    <Link
      href={product.stock > 0 ? `/product/${product.id}?store=${storeId}` : "#"}
      className={`${className} w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm transition-all ${
        product.stock > 0 ? "bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 active:scale-95" : "bg-secondary text-muted-foreground cursor-not-allowed"
      }`}
    >
      {product.stock > 0 ? <><span>Buy Now</span> <ArrowRight size={16} /></> : "Unavailable"}
    </Link>
  );
}
