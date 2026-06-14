"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Trash2, Loader2, Upload, Package } from "lucide-react";
import type { ProductCategory } from "@/lib/db";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" }, { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food & Drinks" }, { value: "digital", label: "Digital Goods" },
  { value: "services", label: "Services" }, { value: "other", label: "Other" },
];

interface Product { id: string; name: string; price: number; description: string; imageUrl: string; category: ProductCategory; stock: number }

export default function ProductsPage() {
  const { publicKey, connected } = useWallet();
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", category: "other" as ProductCategory, stock: "0" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      fetch(`/api/products?wallet=${publicKey.toString()}`).then((r) => r.json()).then(setProducts).finally(() => setLoading(false));
    }
  }, [publicKey]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    const id = Math.random().toString(36).substring(2, 9);
    let imageUrl = "";
    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      imageUrl = (await res.json()).url;
      setUploading(false);
    }
    const product: Product = { id, name: newProduct.name, price: parseFloat(newProduct.price), description: newProduct.description, imageUrl, category: newProduct.category, stock: parseInt(newProduct.stock) || 0 };
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wallet: publicKey.toString(), product }), credentials: "include" });
    setProducts(await res.json());
    setIsCreating(false);
    setNewProduct({ name: "", price: "", description: "", category: "other", stock: "0" });
    setImageFile(null); setImagePreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!publicKey) return;
    const res = await fetch(`/api/products/${id}?wallet=${publicKey.toString()}`, { method: "DELETE", credentials: "include" });
    setProducts(await res.json());
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
        <p className="text-muted-foreground">Connect your Solana wallet to manage products.</p>
      </div>
    );
  }

  return (
    <div className="container px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isCreating && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-lg">
          <h3 className="text-lg font-bold mb-4">New Product</h3>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (USDT)</label>
                <input required type="number" step="0.01" min="0.01" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input type="number" min="0" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg cursor-pointer text-sm hover:bg-secondary/80 transition-colors">
                  <Upload size={14} /> Choose Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
                {uploading && <Loader2 className="animate-spin text-muted-foreground" size={16} />}
                {imagePreview && <img src={imagePreview} alt="" className="w-14 h-14 object-cover rounded-lg border border-border" />}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setIsCreating(false); setImageFile(null); setImagePreview(null); }} className="px-5 py-2 rounded-full text-sm font-medium border border-border hover:bg-secondary transition-colors">Cancel</button>
              <button type="submit" disabled={uploading} className="px-5 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2">{uploading && <Loader2 className="animate-spin" size={14} />}Save</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Loading...</div>
      ) : products.length === 0 && !isCreating ? (
        <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
          <Package size={40} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No products yet</p>
          <button onClick={() => setIsCreating(true)} className="text-primary text-sm font-medium hover:underline">Create your first product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
              {p.imageUrl && <div className="h-40 bg-secondary/50 overflow-hidden"><img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground capitalize">{p.category}</span>
                  {p.stock <= 0 ? <span className="text-[10px] text-destructive font-medium">Out of Stock</span> : <span className="text-[10px] text-muted-foreground">{p.stock} in stock</span>}
                </div>
                <h3 className="font-bold text-sm">{p.name}</h3>
                <p className="text-xl font-extrabold mt-1 text-primary">{p.price} <span className="text-xs text-muted-foreground font-medium">USDT</span></p>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <Link href={`/product/${p.id}?store=${publicKey?.toString()}`} target="_blank" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">Checkout <ExternalLink size={12} /></Link>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
