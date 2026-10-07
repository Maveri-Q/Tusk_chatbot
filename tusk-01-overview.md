# TUSK: Overview

Project for **Walrus Session 8: Chatbots That Remember** (Walrus x FBC, DeepSurge).
Track: **Developer**. Deadline: **Oct 9**. Builder: first-timer, using an AI coding agent.
"Tusk" is a working name (walruses have tusks). Rename freely.

> Section numbers are kept from the original blueprint so cross-references like "section 8.3" still work. See the file map in `tusk-01-overview.md`.

## File map (where each section lives)

| File | Sections |
|---|---|
| `tusk-01-overview.md` (this file) | 1 Goal, 3 Requirements, 4 Architecture, 5 Tech stack, 11 File structure, 13 Milestones, 15 Cut order |
| `tusk-02-backend.md` | 2 What Walrus Memory gives us, 6 SDK cheat sheet, 7 Data model, 8 Backend spec, 9 Memory Firewall, 12 Environment variables |
| `tusk-03-frontend.md` | 10 UI / UX specification (10.1 to 10.4) |
| `tusk-04-agy-coding-practices.md` | 0 Rules for the AI coding agent, general practices, 14 Test plan, 16 Deployment notes, 18 Docs links and VERIFY list |

**Reading order for the agent:** `tusk-04-agy-coding-practices.md` first (rules), then this overview, then backend and frontend as each milestone needs them.

---

## 1. Goal and how we stand out

**Brief from organisers:** build a chatbot that remembers people across conversations, across users, and across devices, using Walrus Memory.

Most entries will be "chatbot remembers your name." Tusk wins on four things:

1. **It works across all three requirements, and you can see it work** (two-account test, two-device test).
2. **Memory you can see.** A "What Tusk remembers" panel shows every fact in plain language, and each answer shows what it remembered. Technical details (where it is stored, Walrus blob ID, relevance) are one click away under "Details".
3. **A memory firewall.** Memory is an attack surface (poisoned memories can hijack a chatbot). Tusk screens what it saves and treats recalled memory as untrusted data. The firewall runs silently for every user. A Security tab with a live log and an "Attack me" demo button exists, but stays hidden until the user switches on the **Advanced tools** switch in the account menu (off by default).
4. **A genuinely polished, sleek UI** (section 10).

---

## 3. Requirements mapped to design

| Requirement | How Tusk does it |
|---|---|
| Remembers across **conversations** | Facts are saved to Walrus Memory after each message and recalled before each reply. Chat history in the UI can be cleared and the bot still knows you. |
| Remembers across **users** | Every signed-in user gets an isolated namespace (`u_<userId>`). Alice's memories never appear for Bob. A shared **Room** namespace (`room_<code>`) lets the bot remember several people in one space, with attribution. Signing in with two different accounts proves isolation. |
| Remembers across **devices** | Memory is keyed to the signed-in **account**, not the browser. Log in on phone or laptop and get the same memories, because they live in Walrus, not localStorage. |

---

## 4. Architecture

```
Browser (Next.js UI)
  |  chat message, memory ON/OFF, optional roomId
  v
Next.js API route  /api/chat          (server only; holds secrets)
  1. Auth -> userId, displayName
  2. Rate limit (Upstash)
  3. If memory ON: recall from personal ns (+ room ns)  --> Walrus Memory relayer
  4. Firewall (read side): filter forgotten, sanitize, wrap as untrusted data
  5. streamText (Gemini) with memory context in the system prompt
  6. Stream reply + "recalled memories" metadata to the UI
  7. In background (after response): extract facts -> firewall (write side)
     -> dedupe -> remember() -> poll job -> save metadata
  v
Walrus Memory relayer -> Seal encrypt -> Walrus (source of truth) + vector index
Upstash Redis: only UX metadata (forgotten blob IDs, categories, timestamps,
               security log, room membership). NOT the memory text.
```

### Identity and memory ownership: two tiers

**Tier A (BUILD THIS): app-owned account, namespace per user.**
The server holds one MemWal account and delegate key. Each app user maps to a namespace. Isolation is enforced by our server code (namespace always derived from the authenticated user id on the server, never from client input).

**Tier B (STRETCH, probably skip): user-owned memory.**
Each user connects a Sui wallet, creates their own MemWalAccount (`createAccount`), and adds the app's delegate key (`addDelegateKey`). Then the user truly owns the memory and can revoke the app. This is a strong story but costs a lot of time. **VERIFY before attempting:** the "Ownership and Delegates" docs page and the playground app source, specifically whether one delegate key can act for many accounts.

---

## 5. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest stable), App Router, TypeScript | Deploy on Vercel |
| Styling | Tailwind CSS + shadcn/ui | Dark theme, custom tokens (section 10) |
| Motion | Framer Motion | Respect `prefers-reduced-motion` |
| Icons | lucide-react | |
| Chat | Vercel AI SDK: `ai`, `@ai-sdk/react`, `@ai-sdk/google` | Check installed version docs |
| Model | Google Gemini Flash (free tier) | Use the current Flash model id from aistudio.google.com. Keep the model id in one env var. |
| Memory | `@mysten-incubation/memwal` plus peer deps `@mysten/sui`, `@mysten/seal`, `@mysten/walrus` | |
| Auth | Clerk (Google + email sign-in) | Fastest to set up and works across devices. Fallback: Auth.js with Google. |
| Metadata store | Upstash Redis (+ `@upstash/ratelimit`) | Free tier, REST based |
| Validation | zod | Structured fact extraction |
| Markdown | `react-markdown` + `remark-gfm` | Assistant messages |

---

## 11. Suggested file structure

```
tusk/
  app/
    layout.tsx
    page.tsx                      # landing
    chat/page.tsx                 # app shell
    api/
      chat/route.ts
      memories/route.ts
      memories/forget/route.ts
      memories/status/route.ts
      security-log/route.ts
      rooms/route.ts
      health/route.ts
      demo/attack/route.ts
  components/
    landing/ (Hero, OrbsBackground, SplitDemo, HowItWorks)
    chat/ (ChatView, MessageBubble, Composer, RecalledMemories, StarterChips)
    lens/ (MemoryLens, MemoryCard, Timeline, SecurityTab)
    shell/ (Sidebar, TopBar, MemoryToggle, RoomDialog)
    ui/                           # shadcn
  lib/
    memwal.ts                     # single MemWal client + helpers
    namespaces.ts                 # personal/room namespace builders
    firewall.ts                   # write-side and read-side checks
    extract.ts                    # LLM fact extraction (zod)
    redis.ts                      # Upstash client + typed helpers
    prompts.ts                    # system prompt builder
    rate-limit.ts
  scripts/
    smoke-test.mjs                # remember -> recall proof
  DECISIONS.md
  BUGS.md
  README.md
  .env.local                      # never committed
```

---

## 13. Milestones (with acceptance checks)

### M0. Credentials and smoke test
- Human gets account ID and delegate key from `memory.walrus.xyz`. Fill `.env.local`.
- `scripts/smoke-test.mjs`: `health()`, then `remember` + `waitForRememberJob`, then `recall`.
- **Accept:** health returns ok; recall returns the fact just saved.

### M1. Scaffold and UI shell
- `create-next-app`, Tailwind, shadcn, fonts, tokens, background.
- App shell layout (sidebar, chat column, memory panel placeholder, top bar). Basic streaming chat with Gemini, **no memory yet**.
- **Accept:** polished empty state, messages stream, layout is responsive down to 375px.

### M2. Quick-win memory with `withMemWal`
- Wrap the model with `withMemWal`, fixed namespace.
- **Accept:** tell it a fact, refresh the page, ask about it, and it answers correctly. This is the **safety net build**: keep it deployable.

### M3. Auth, per-user namespaces, Redis
- Clerk sign-in. Namespace from user id on the server.
- Create two real test accounts to check isolation. There is no persona switcher in the UI.
- Upstash Redis client and rate limit.
- **Accept:** user A saves a fact; user B asks and gets nothing; A on a second device or browser sees it.

### M4. Custom memory pipeline and Memory Lens
- Replace `withMemWal` with the pipeline in section 8 (recall, firewall, prompt, stream, background extract/store, dedupe, metadata).
- Recalled memories row, Memory ON/OFF, Memories tab with Syncing -> Stored states, soft Forget, status polling.
- **Accept:** facts appear in the panel within seconds, "Remembered N things" shows the right memories (relevance visible under Details), Forget hides a memory from both panel and bot, memory OFF means no recall and no save.

### M5. Firewall, Security tab, landing page, motion
- Full section 9 rules. Security tab. "Attack me" demo.
- Landing page, orbs, animated split demo, toasts, polish pass, OG image.
- **Accept:** with Advanced tools on, the attack demo is blocked and logged with a reason; secrets (fake seed phrase, fake private key) are refused; landing page looks great on mobile and desktop.

### M6. Rooms (stretch)
- Room create/join, shared namespace, speaker attribution, Room badges.
- **Accept:** two users in one room; the bot answers "who owns the backend?" using facts from both; personal facts stay private.

### M7. Compare mode, Timeline, command palette (stretch)
- Do in this order: Timeline, Compare mode, command palette.

### M8. Deploy, docs, demo
- Deploy to Vercel with env vars set. Smoke test on the live URL from a phone.
- README, architecture diagram, demo video, article draft. The README and the demo video must show people how to turn on Advanced tools (account menu), since judges will not find it otherwise.
- **Accept:** a stranger can open the link, sign in, and see memory working in under 2 minutes.

---

## 15. Cut order and fallbacks

If time runs short, cut in this order (top first):
1. Command palette
2. Compare mode
3. Timeline tab
4. Rooms
5. Fancy landing animations (keep a clean static hero)

**Never cut:** auth + per-user namespaces, Memory Lens (Memories tab), Memory ON/OFF, firewall basics, deployed link, README, demo video.

**Fallback if the custom pipeline (M4) breaks late:** ship the M2 `withMemWal` build with auth namespaces from M3 and the UI from M1/M5. It still satisfies all three requirements.
