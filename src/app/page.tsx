import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import ParticleField from "@/components/ParticleField";
import { ArrowRight, CheckCircle2, ScanLine, ShieldCheck, Store, Wallet } from "lucide-react";

const steps = [
  { icon: Store, title: "Create your store", text: "Add products, set stock, and choose where USDT lands." },
  { icon: ScanLine, title: "Buyer scans or connects", text: "Works with Phantom, Solflare, Binance, OKX, and raw Solana addresses." },
  { icon: ShieldCheck, title: "Verify on-chain", text: "Paste a signature or let the wallet payment confirm directly." },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden relative">
      <ParticleField count={50} />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        <div className="absolute -left-24 bottom-20 h-80 w-80 rounded-full bg-amber-700/10 blur-3xl" />
      </div>

      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <Logo size={28} />
        <nav className="flex items-center gap-3">
          <Link href="/store" className="hidden sm:block text-sm text-muted-foreground hover:text-primary transition-colors">
            Browse Stores
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2 rounded-full hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-16">
        <section className="container max-w-6xl mx-auto grid lg:grid-cols-[1fr_440px] gap-12 items-center min-h-[calc(100vh-88px)] py-12">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-xs text-muted-foreground mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live on Solana Mainnet
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.02] min-h-[1.2em]">
              <span className="typewriter-word bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent bg-transparent">Lipa</span>{" "}
              <span className="typewriter-word bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent bg-transparent">Chaji</span>{" "}
              <span className="typewriter-word bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent bg-transparent" style={{ borderRight: "2px solid hsl(38, 92%, 50%)", animation: "typewriter 1.5s steps(30) 2.4s forwards, blink 0.8s step-end 2.4s infinite" }}>Wako</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              A storefront and checkout layer for merchants who want direct USDT payments without holding customer funds.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/dashboard" className="group px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/20 active:scale-95">
                Launch Store <ArrowRight size={16} className="inline-block ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/store" className="px-8 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 transition-all active:scale-95">
                Explore Shops
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 text-xs text-muted-foreground">
              {['No custody', 'On-chain verification', 'Wallet optional for buyers'].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5">
                  <CheckCircle2 size={12} className="text-primary" /> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-3xl animate-pulse" />
            <div className="relative rounded-[2rem] border border-border bg-card/80 backdrop-blur-xl p-5 shadow-2xl shadow-black/30 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-muted-foreground">Checkout Preview</p>
                  <h3 className="font-bold">Solar Charger Kit</h3>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">Verified</span>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 p-1 animate-pulse" style={{ animationDuration: "5s" }}>
                <div className="rounded-[1.35rem] bg-background p-5">
                  <div className="grid grid-cols-[96px_1fr] gap-4 items-center">
                    <div className="h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-zinc-950 flex items-center justify-center">
                      <Wallet size={34} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-3xl font-black text-primary">12.50 <span className="text-sm text-foreground">USDT</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Send directly to merchant wallet</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-border bg-secondary/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl bg-white p-2 grid grid-cols-3 gap-1">
                        {Array.from({ length: 9 }).map((_, i) => <span key={i} className="rounded-sm bg-black" style={{ opacity: [1, .25, .7, .4, 1, .25, .8, .35, 1][i] }} />)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">Scan or connect wallet</p>
                        <p className="text-xs text-muted-foreground">Binance, OKX, Phantom, Solflare</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
                <span className="rounded-xl bg-secondary py-2">Create</span>
                <span className="rounded-xl bg-secondary py-2">Pay</span>
                <span className="rounded-xl bg-secondary py-2">Verify</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container max-w-6xl mx-auto grid md:grid-cols-3 gap-4 pb-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur hover:border-primary/50 transition-colors" style={{ animationDelay: `${index * 120}ms` }}>
                <div className="mb-4 h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
