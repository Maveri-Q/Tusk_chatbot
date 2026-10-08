import { NextResponse } from "next/server";
import { getMemWalClient, addInstantFact, updateInstantFactBlob, getAllUserMemories } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { setMemoryMetadata } from "@/lib/redis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export const DEMO_USERS = [
  {
    userId: "tobeotuonye",
    name: "Tobe Otuonye",
    email: "tobe@tusk.dev",
    role: "Fullstack Engineer & Founder",
    memories: [
      { text: "The user is building Tusk, an AI companion powered by Walrus decentralized storage.", category: "project" },
      { text: "The user prefers TypeScript, Next.js App Router, and Tailwind CSS for frontend engineering.", category: "preference" },
      { text: "The user deploys production serverless web apps to Vercel.", category: "preference" },
      { text: "The user is based in Lagos, Nigeria and works across GMT+1 timezone.", category: "identity" },
      { text: "The user owns an 8-inch Dobsonian telescope and loves stargazing at dark sky reserves.", category: "preference" },
      { text: "The user is interested in zero-knowledge cryptography, Seal encryption, and decentralized blob storage.", category: "skill" },
      { text: "The user drinks double-shot dark roast espresso with oat milk every morning.", category: "preference" },
      { text: "The user is competing in the Walrus Session 8 Developer Track hackathon.", category: "goal" },
      { text: "The user uses Arch Linux on a ThinkPad for local development and prefers NeoVim keybindings.", category: "preference" },
      { text: "The user is building a shared memory room feature for collaborative engineering teams.", category: "project" },
      { text: "The user prefers concise technical answers with architectural rationale rather than generic code templates.", category: "preference" },
    ],
  },
  {
    userId: "sarah_lin",
    name: "Sarah Lin",
    email: "sarah.lin@design.co",
    role: "Principal Product Designer",
    memories: [
      { text: "The user is a Principal Product Designer leading design systems for fintech applications.", category: "identity" },
      { text: "The user prefers high-contrast dark themes inspired by warm Arctic palettes, obsidian black, and lime accents.", category: "preference" },
      { text: "The user is redesigning an onboarding workflow to reduce user drop-off during cryptographic wallet creation.", category: "project" },
      { text: "The user lives in San Francisco, California and frequently works from Hayes Valley coffee shops.", category: "identity" },
      { text: "The user uses Figma for interface wireframes and prefers an 8pt spatial grid with subtle spring animations.", category: "preference" },
      { text: "The user is training for a half-marathon and runs 15 kilometers every weekend along the Embarcadero.", category: "goal" },
      { text: "The user is passionate about accessible UX and insists on WCAG AAA color contrast for all typography.", category: "skill" },
      { text: "The user drinks ceremonial grade matcha latte unsweetened in the afternoon.", category: "preference" },
      { text: "The user prefers minimalist dashboards where secondary technical metrics are tucked into collapsible drawers.", category: "preference" },
      { text: "The user is testing haptic feedback patterns for mobile decentralized transaction confirmations.", category: "project" },
      { text: "The user loves mid-century modern furniture and collects vintage mechanical watches.", category: "preference" },
    ],
  },
  {
    userId: "marcus_vance",
    name: "Marcus Vance",
    email: "marcus@biotech.ai",
    role: "Senior AI Research Engineer",
    memories: [
      { text: "The user is a Senior AI Research Engineer specializing in multimodal retrieval and long-context architectures.", category: "identity" },
      { text: "The user is benchmarking cosine similarity thresholds against Walrus decentralized vector embeddings.", category: "project" },
      { text: "The user works remotely from Boston, Massachusetts near the MIT campus.", category: "identity" },
      { text: "The user trains lightweight reasoning models using LoRA fine-tuning and 4-bit quantization.", category: "skill" },
      { text: "The user has a 3-year-old Golden Retriever named Kepler who joins him on daily hiking trails.", category: "preference" },
      { text: "The user prefers Python and PyTorch for model experimentation and uses dual RTX 4090 GPUs.", category: "preference" },
      { text: "The user is publishing a paper on privacy-preserving retrieval augmented generation with homomorphic encryption.", category: "project" },
      { text: "The user is a competitive chess player with an online Blitz rating around 2100 on Lichess.", category: "skill" },
      { text: "The user drinks Earl Grey tea with bergamot and a slice of lemon.", category: "preference" },
      { text: "The user is evaluating latency differences between Gemini Flash Lite and Gemini Flash latest endpoints.", category: "project" },
      { text: "The user avoids complex boilerplate frameworks and prefers clean, functional APIs.", category: "preference" },
    ],
  },
];

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    const client = getMemWalClient();
    const summary: Record<string, { totalBefore: number; added: number; totalAfter: number }> = {};

    for (const demoUser of DEMO_USERS) {
      const namespace = getPersonalNamespace(demoUser.userId);
      const existing = await getAllUserMemories(namespace);
      const beforeCount = existing.length;
      let added = 0;

      for (const m of demoUser.memories) {
        // Skip if exact text already stored
        const alreadyExists = existing.some(
          (ex) => ex.text.toLowerCase().trim() === m.text.toLowerCase().trim()
        );
        if (alreadyExists) continue;

        const tempBlobId = `walrus_seed_${demoUser.userId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        addInstantFact(namespace, m.text, tempBlobId, "saved");

        let actualJobId: string | undefined;

        if (client) {
          try {
            const job = await client.remember(m.text, namespace);
            if (job?.job_id) {
              actualJobId = job.job_id;
              // Poll job in background without blocking this HTTP request
              client.waitForRememberJob(job.job_id).then((done) => {
                if (done?.blob_id) {
                  updateInstantFactBlob(namespace, tempBlobId, done.blob_id);
                }
              }).catch(() => {});
            }
          } catch (e) {
            console.warn("Relayer remember error:", e);
          }
        }

        await setMemoryMetadata(demoUser.userId, tempBlobId, {
          category: m.category,
          createdAt: new Date().toISOString(),
          scope: "personal",
          jobId: actualJobId,
        });

        added++;
      }

      const afterMemories = await getAllUserMemories(namespace);
      summary[demoUser.userId] = {
        totalBefore: beforeCount,
        added,
        totalAfter: afterMemories.length,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Successfully seeded 3 demo users with 10+ Walrus memories each",
      users: DEMO_USERS.map((u) => ({ id: u.userId, name: u.name, role: u.role, memoryCount: summary[u.userId]?.totalAfter })),
      results: summary,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
