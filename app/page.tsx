import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, HardDrive, Smartphone, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-flare selection:text-flare-foreground relative overflow-hidden">
      {/* Navigation */}
      <nav className="h-16 px-6 glass-panel border-b border-border flex items-center justify-between z-20 max-w-6xl mx-auto w-full mt-4 rounded-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-sm bg-flare/20 border border-flare/40 flex items-center justify-center text-flare font-display font-bold text-lg">
            T
          </div>
          <span className="font-display font-bold text-text text-xl tracking-tight">
            TUSK
          </span>
        </div>

        <Link href="/chat">
          <Button size="sm" className="gap-1.5 text-xs font-semibold">
            <span>Open Chat</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Built for Walrus Session 8: Chatbots That Remember</span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-6xl text-text tracking-tight max-w-3xl leading-[1.15]">
          A chatbot that <span className="text-flare">actually remembers</span> you.
        </h1>

        <p className="text-base sm:text-lg text-text-muted mt-6 max-w-xl leading-relaxed">
          Encrypted with Seal. Stored on decentralized Walrus storage. Yours across conversations, accounts, and every device.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <Link href="/chat">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold text-sm">
              <span>Start chatting</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto text-sm text-text-muted hover:text-text">
              See how it works
            </Button>
          </a>
        </div>

        {/* 3 Value Pillars */}
        <div id="how-it-works" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 text-left w-full">
          <div className="p-5 rounded-sm bg-bg-elev border border-border flex flex-col gap-2.5">
            <div className="h-9 w-9 rounded bg-flare/10 border border-flare/20 flex items-center justify-center text-flare mb-1">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="font-display font-semibold text-text text-sm">
              Across Conversations
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Clear your chat history anytime. Tusk stores facts in Walrus Memory, recalling them seamlessly when you return.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-bg-elev border border-border flex flex-col gap-2.5">
            <div className="h-9 w-9 rounded bg-lime/10 border border-lime/20 flex items-center justify-center text-lime mb-1">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="font-display font-semibold text-text text-sm">
              Across Users (Isolated)
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Strict per-user cryptographic namespaces. Alice never sees Bob’s memories, enforced server-side.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-bg-elev border border-border flex flex-col gap-2.5">
            <div className="h-9 w-9 rounded bg-flare/10 border border-flare/20 flex items-center justify-center text-flare mb-1">
              <Smartphone className="h-4 w-4" />
            </div>
            <h3 className="font-display font-semibold text-text text-sm">
              Across Devices
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Memory is anchored to your account, not local browser cache. Switch from phone to laptop without missing a beat.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40 text-center text-xs text-text-muted z-10">
        <p>Tusk • Powered by Mysten Labs Walrus Memory & Google Gemini</p>
      </footer>
    </main>
  );
}
