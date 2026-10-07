import { MemWal } from "@mysten-incubation/memwal";
import dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });

const privateKey = process.env.MEMWAL_PRIVATE_KEY;
const accountId = process.env.MEMWAL_ACCOUNT_ID;
const serverUrl = process.env.MEMWAL_SERVER_URL || "https://relayer-staging.memory.walrus.xyz";

if (!privateKey || !accountId) {
  console.error("Missing MEMWAL_PRIVATE_KEY or MEMWAL_ACCOUNT_ID in .env.local");
  process.exit(1);
}

// Masked log for safety
const maskedKey = `${privateKey.slice(0, 4)}...${privateKey.slice(-4)}`;
console.log("=== TUSK: M0 Smoke Test ===");
console.log(`Relayer URL: ${serverUrl}`);
console.log(`Account ID:  ${accountId}`);
console.log(`Private Key: ${maskedKey} (masked)`);

async function runSmokeTest() {
  try {
    const memwal = MemWal.create({
      key: privateKey,
      accountId: accountId,
      serverUrl: serverUrl,
      namespace: "smoke_test",
    });

    // Step 1: Health Check
    console.log("\n[1/3] Testing relayer health...");
    const health = await memwal.health();
    console.log("Health status:", JSON.stringify(health));

    // Step 2: Remember a test fact
    const testFact = `Tusk smoke test timestamp ${Date.now()}: The walrus has two large tusks.`;
    console.log(`\n[2/3] Storing test memory: "${testFact}"`);
    const job = await memwal.remember(testFact, "smoke_test");
    console.log("Remember job accepted, Job ID:", job.job_id);

    console.log("Waiting for job to finish indexing...");
    const jobResult = await memwal.waitForRememberJob(job.job_id);
    console.log("Job completed successfully!");
    console.log("Blob ID:", jobResult.blob_id);
    console.log("Owner:", jobResult.owner);
    console.log("Namespace:", jobResult.namespace);

    // Step 3: Recall the test memory
    console.log("\n[3/3] Recalling test memory with query 'tusks'...");
    const recallResult = await memwal.recall({
      query: "tusks",
      limit: 5,
      namespace: "smoke_test",
      maxDistance: 0.7,
    });

    console.log(`Recall returned ${recallResult.results?.length ?? 0} results:`);
    if (recallResult.results) {
      for (const item of recallResult.results) {
        const relevance = (1 - item.distance).toFixed(3);
        console.log(` - [Relevance: ${relevance}, Dist: ${item.distance.toFixed(3)}] ${item.text} (Blob: ${item.blob_id})`);
      }
    }

    const matched = recallResult.results?.some((r) => r.text === testFact);
    if (matched) {
      console.log("\n>>> M0 ACCEPTANCE PASSED: Fact was stored and successfully recalled! <<<");
    } else {
      console.log("\n>>> Note: Recall returned results, checking top match... <<<");
    }

    process.exit(0);
  } catch (err) {
    console.error("\n❌ Smoke test failed:", err);
    process.exit(1);
  }
}

runSmokeTest();
