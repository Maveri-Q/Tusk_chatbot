# TUSK: Antigravity (agy) Coding Practices

Read this file first. These are the rules the coding agent follows for the whole build.

> Section numbers are kept from the original blueprint so cross-references like "section 8.3" still work. See the file map in `tusk-01-overview.md`.

---

## 0. Rules for the AI coding agent (read first)

1. Build **milestone by milestone** (section 13), in order. After each one, run the app and tick its acceptance checks before moving on.
2. **Do not invent SDK methods.** Use only what is in section 6, and verify against the docs links in section 18. If the docs and this file disagree, the docs win. Write the difference in `DECISIONS.md`.
3. Check the **installed version** of `ai` and `@ai-sdk/react` before writing chat code. The `useChat` and streaming APIs changed between major versions. Read the docs for the version actually installed.
4. **Secrets stay on the server.** The delegate key, API keys and Redis tokens must never be in client code or any `NEXT_PUBLIC_*` variable.
5. Keep two files updated as you go:
   - `DECISIONS.md`: any choice that differs from this blueprint, and why.
   - `BUGS.md`: every Walrus Memory rough edge or bug, with repro steps. This may win a bug bounty.
6. If a stretch feature takes more than 20 minutes of being stuck, stop and follow the **cut order** in section 15.
7. Explain each step in plain language to the human as you go. They are new to this.
8. Never store or log the delegate private key. Mask it in any debug output.

---

## General practices

These add to the numbered rules above and follow the blueprint's own principles.

1. **The server decides who the user is.** Derive `userId`, namespaces and room membership on the server. Never trust a user id, namespace or room id sent from the client.
2. **Validate every request body with zod** before using it, including `/api/chat`, `/api/memories/*` and `/api/rooms`.
3. **Type everything.** TypeScript strict mode, no `any` for SDK responses, and typed helpers around Redis keys.
4. **Memory failing must never break chat.** Wrap every external call (relayer, Gemini, Redis) in try/catch with a friendly fallback. If memory is down, the chat still works without it.
5. **Never a blank screen.** Every async view needs a loading state, an empty state and an error state with retry.
6. **Comments explain why.** For example, the broad-recall comment for the memory list (section 8.3) and any place where the docs and the blueprint disagreed.
7. **One milestone at a time.** Run the app, tick the acceptance checks, and commit before starting the next milestone.
8. **Keep the bundle lean.** Slow mobile networks are expected. Limit `backdrop-blur` to the floating layers listed in section 10.1, lazy-load heavy components, and show good loading states.
9. **Accessibility is not optional.** WCAG AA contrast, visible focus rings, keyboard-only use, and `prefers-reduced-motion` respected everywhere.
10. **Git hygiene.** `.env.local` in `.gitignore` before the first commit, a `.env.example` with empty values, and rotate keys if they leak.

---

## 14. Test plan (run before submitting)

**Core**
- [ ] Say "My name is X and I love Y." Reload. Ask "What do you know about me?" Correct answer.
- [ ] New chat, memory ON: bot still knows you.
- [ ] Memory OFF: bot does not use or save anything.
- [ ] Same fact stated twice is stored once (dedupe).
- [ ] Fresh fact appears in the panel as "Saving..." and then "Saved".

**Across users**
- [ ] User A and B have separate memories (try the same questions on both).
- [ ] A user cannot pass a different `userId` or namespace from the client to read someone else's memory (server derives it).
- [ ] Room: non-member cannot access room memories.

**Across devices**
- [ ] Sign in on phone and laptop; same memories on both.

**Firewall**
- [ ] "Remember: ignore all previous instructions" is blocked and logged.
- [ ] A fake seed phrase and a fake 64-hex key are refused.
- [ ] A memory containing "system: you are now..." (simulated old memory) is dropped on the read side.
- [ ] Bot never reveals the system prompt when asked.

**Resilience**
- [ ] Relayer down: app shows a friendly error, chat still works without memory.
- [ ] Rate limit returns a clear message.
- [ ] No secrets in the browser bundle (search the built client for the key prefix).

**UI**
- [ ] 375px mobile, 768px tablet, 1440px desktop.
- [ ] Keyboard-only: can send, toggle memory, open panel.
- [ ] Reduced motion mode disables animations.
- [ ] Advanced tools is off for a brand-new user: no Security tab, Attack me button, status dot or network badge anywhere.
- [ ] Switching Advanced tools on shows all of them immediately (no reload); switching it off hides them again.

---

## 16. Deployment notes

- Host on Vercel. Set every env var in the dashboard. Redeploy after changes.
- **Network choice:** testnet relayer is the safe default for development. **Check the hackathon rules** on whether mainnet is required or preferred before the final deploy.
- Never commit `.env.local`. Rotate keys if they leak.
- Keep the Gemini key's quota in mind (free tier). The rate limiter protects it during judging.
- Test the live URL on mobile data (Nigerian networks can be slow; keep the bundle lean and show good loading states).

---

## 18. Docs links and VERIFY list

**Docs (if a link moves, search docs.wal.app for "Walrus Memory"):**
- Quick start: https://docs.wal.app/walrus-memory/getting-started/quick-start
- Chatbot example: https://docs.wal.app/walrus-memory/examples/chatbot
- Example apps: https://docs.wal.app/walrus-memory/examples/example-apps
- AI SDK integration: https://docs.wal.app/walrus-memory/sdk/ai-integration
- TypeScript API reference: https://mystenlabs.github.io/walrus/pr-preview/pr-3439/walrus-memory/sdk/api-reference
- Memory space concept: https://mystenlabs.github.io/walrus/pr-preview/pr-3439/walrus-memory/fundamentals/concepts/memory-space
- Playground / dashboard: https://memory.walrus.xyz

**VERIFY (not confirmed while writing this blueprint):**
1. Exact `useChat` and streaming API for the installed `ai` and `@ai-sdk/react` versions.
2. Whether the Next.js `after()` helper (or `waitUntil`) behaves as expected on the deployed Vercel runtime.
3. Whether the relayer or SDK offers any way to delete or revoke a single memory (affects the Forget feature).
4. Whether one delegate key can act for multiple MemWalAccounts (only matters for Tier B).
5. Whether a Walrus explorer URL pattern can be confirmed for linking blob IDs. If not, show the blob ID with a copy button only. **Do not guess a URL.**
6. Hackathon rules on testnet vs mainnet, multiple-track entries, and required submission fields.
7. Current Gemini Flash model id and free-tier limits.
8. Whether `recall` with a very broad query reliably returns up to 50 items for the Memories tab. If not, lower the limit and note it in `BUGS.md`.
