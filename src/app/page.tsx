import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import ParticleField from "@/components/ParticleField";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      <ParticleField count={50} />

      <header className="relative z-10 px-6 py-5 flex items-center justify-between" style={{ position: "relative", zIndex: 10 }}>
        <Logo size={28} />
        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2 rounded-full hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-6" style={{ position: "relative", zIndex: 10 }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-xs text-muted-foreground mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Solana Network
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] min-h-[1.2em]">
            <span className="typewriter-word bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent bg-transparent">Lipa</span>{" "}
            <span className="typewriter-word bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent bg-transparent">Chaji</span>{" "}
            <span className="typewriter-word bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent bg-transparent" style={{ borderRight: "2px solid hsl(38, 92%, 50%)", animation: "typewriter 1.5s steps(30) 2.4s forwards, blink 0.8s step-end 2.4s infinite" }}>Wako</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Non-custodial USDT payments on Solana.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group relative px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/20 active:scale-95"
            >
              Start Accepting
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/store"
              className="px-8 py-3.5 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/80 transition-all active:scale-95"
            >
              Browse Stores
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
