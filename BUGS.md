# TUSK: Walrus Memory Bug Tracker & Feedback

This document logs all observed rough edges, SDK quirks, relayer issues, and improvement ideas encountered while integrating Walrus Memory (`@mysten-incubation/memwal`) for Walrus Session 8.

---

## 🐛 Observed Friction Points & Bugs

| ID | Component | Summary | Repro Steps / Technical Notes | Workaround in Tusk |
|---|---|---|---|---|
| **BUG-001** | Relayer / SDK | **Absence of Individual Memory Deletion / Revocation** | The MemWal SDK and relayer have no method to delete, revoke, or tombstone an individual memory blob. Once stored, a memory persists in the vector index. | Implemented a server-side "Soft Forget" layer in Redis / metadata that filters out forgotten blob IDs during read-side screening. |
| **BUG-002** | Indexer | **Asynchronous Indexing Latency in Multi-Turn Dialogues** | `remember()` returns a job ID while the relayer encrypts with Seal and indexes on Sui (taking 2–4 seconds). In quick conversational back-and-forth, `recall()` on turn 2 misses turn 1's facts because indexing is still pending. | Implemented an "Instant Fact" zero-latency read-through cache on local disk (`/tmp`) that merges immediately with Walrus results. |
| **BUG-003** | Relayer | **Generic 500 Errors for Unfunded / Non-Existing Accounts** | If an invalid or uninitialized `MEMWAL_ACCOUNT_ID` is used, the relayer returns an opaque HTTP 500 internal server error instead of a clear 404 or 400 explaining that the Sui account object does not exist. | Added diagnostic smoke-test script (`npm run smoke-test`) that validates credentials and account existence prior to booting. |
| **BUG-004** | SDK | **No Namespace Listing / Discovery API** | Applications that dynamically create personal or room namespaces (e.g. `personal:<userId>`, `room:<roomId>`) have no SDK method to list all active namespaces tied to their delegate key. | Maintained namespace registration in metadata index. |

---

## 💡 Top Improvement Ideas for the Walrus Team

1. **Batch Memory Ingestion (`rememberBatch`)**:
   - Currently, saving 10 facts requires 10 distinct signed HTTP calls to the relayer. Adding a `client.rememberBatch([{ text, namespace }])` method would reduce network roundtrips by 90% and enable efficient onboarding and conversation summarization.

2. **Tombstone / Revocation Marker on Relayer**:
   - Allow signing a `client.forget(blob_id)` request that marks the vector embedding as inactive in the relayer's index. This would provide native privacy compliance (GDPR/right-to-be-forgotten) without requiring external databases.

3. **Standardized Explorer Linking for Memory Blobs**:
   - Introduce a canonical URL schema (e.g. `https://walruscan.com/mainnet/blob/<blob_id>`) so developers can easily link users directly to their encrypted Walrus storage blobs on-chain.
