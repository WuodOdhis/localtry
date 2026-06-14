"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Loader2, Search, Package } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full text-primary">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold">Store</h1>
                <p className="text-xs text-muted-foreground font-mono">{storeId.slice(0, 4)}...{storeId.slice(-4)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/orders" className="text-xs text-muted-foreground hover:text-primary transition-colors">My Orders</Link>
              <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">ChajiPay</Link>
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 container px-6 py-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold mb-1">
              {search || selectedCategory !== "all" ? "No matching products" : "No products found"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search || selectedCategory !== "all" ? "Try a different search or category" : "This store has no products yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group flex flex-col hover:shadow-lg hover:shadow-primary/5">
                {p.imageUrl ? (
                  <div className="h-48 bg-secondary/50 overflow-hidden">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-48 bg-secondary/50 flex items-center justify-center">
                    <Package size={40} className="text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground capitalize">{p.category}</span>
                      {p.stock <= 0 && <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">Out of Stock</span>}
                    </div>
                    <h3 className="font-bold text-base">{p.name}</h3>
                    <p className="text-2xl font-extrabold mt-1.5 text-primary">{p.price} <span className="text-xs text-muted-foreground font-medium">USDT</span></p>
                    <p className="text-muted-foreground mt-2 text-xs line-clamp-2">{p.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/50">
                    <Link
                      href={p.stock > 0 ? `/product/${p.id}?store=${storeId}` : "#"}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-opacity ${
                        p.stock > 0
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {p.stock > 0 ? <><span>Buy Now</span> <ArrowRight size={16} /></> : "Unavailable"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/50">
        Powered by ChajiPay &mdash; Lipa Chaji Wako
      </footer>
    </div>
  );
}
