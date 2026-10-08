# TUSK 🦣 — A Chatbot That Actually Remembers You

> **Walrus Session 8: Chatbots That Remember** (Walrus x FBC, DeepSurge)  
> **Track:** Developer Track  
> **Built with:** Walrus Memory (`@mysten-incubation/memwal`), Google Gemini Flash, Next.js 15, and Tailwind CSS.

---

## 🌟 Overview & Why Tusk Stands Out

Most chatbots claim to have memory by storing conversation logs in `localStorage` or reciting names. **Tusk** delivers true, decentralized, cryptographic memory with four key innovations:

1. **True Three-Way Persistence**:
   - **Across Conversations**: Clearing chat history or refreshing the browser never erases what Tusk remembers. Memories live in Walrus storage blobs.
   - **Across Users (Strict Isolation)**: Personal namespaces (`u_<userId>`) are cryptographically derived on the server. Alice's facts are never recalled for Bob.
   - **Across Devices**: Memory is bound to the authenticated account on Walrus, allowing users to seamlessly transition between mobile phones and laptops.

2. **Memory You Can See ("MemoryLens")**:
   - A dedicated right-hand side panel displays every remembered fact in clear language.
   - Every answer shows a collapsed **"Remembered N things"** chip with real-time relevance scores and Walrus blob IDs under "Details".
   - **Transparent Soft Forget**: Removing a memory deletes it from the bot and UI while honestly informing the user that decentralized encrypted data on Walrus persists until epoch expiration.

3. **Active Memory Firewall**:
   - Memory is treated as untrusted data (`<memory_context>`).
   - **Write Side**: LLM extraction converts raw dialogue into declarative, 3rd-person facts. Heuristics reject prompt injections (`"ignore previous instructions"`), commands, and secrets (seed phrases, private keys, API tokens).
   - **Read Side**: Filters forgotten items, strips malicious patterns, and wraps memories as untrusted data in the system prompt.
   - **Live "Attack Me" Demo**: Allows users and judges to test injection defense and view real-time blocked threats in the Security Log.

4. **Warm Arctic Aesthetic**:
   - Styled with a dark, warm aesthetic: warm near-black brown (`#120D0B`), tusk ivory (`#F6EEE0`), signal flare orange (`#FF6A2B`), and lime memory accents (`#C4F24A`).
   - Fully responsive down to 375px mobile viewports, WCAG AA contrast compliant, and reduced-motion friendly.

---

## ⚙️ Architecture

```
Browser (Next.js 15 UI)
   │
   │  Chat message + "Remember me" toggle
   ▼
Next.js API Route (/api/chat) ─── holds all secrets server-side
   1. Authenticate user & apply rate limit (Upstash)
   2. Derive personal namespace (u_<userId>) strictly on server
   3. If Memory ON:
      ├── Parallel recall from Walrus relayer (maxDistance: 0.7)
      ├── Drop forgotten blobs (Redis/Memory metadata)
      └── Read-Side Firewall (strip injections, sanitize)
   4. Build security-hardened system prompt with <memory_context>
   5. Stream Gemini Flash response + attach x-recalled-memories header
   6. In background:
      ├── LLM extracts durable 3rd-person facts (Zod structured output)
      ├── Write-Side Firewall (screen injections, keys, secrets)
      ├── Vector Deduplication (skip if cosine distance < 0.12)
      ├── memwal.remember() -> wait for Walrus indexer
      └── Save metadata to Redis
   ▼
Walrus Memory Relayer ──> Seal Encryption ──> Sui & Walrus Blob Storage
```

---

## 👥 3 Showcase Users (10+ Walrus Memories Each)

Per the Session 8 hackathon submission requirements, Tusk includes 3 distinct, fully populated user personas with 10+ cryptographic Walrus memories each. You can switch between them with **1 click** in the app:

| User | Namespace | Role | Stored Facts | Example Prompt to Try |
|---|---|---|---|---|
| **Tobe Otuonye** | `personal:tobeotuonye` | Fullstack Engineer & Founder | **12 memories** | *"What telescope do I use and what coffee do I drink?"* |
| **Sarah Lin** | `personal:sarah_lin` | Principal Product Designer | **11 memories** | *"What spatial grid and tea do I prefer in my design workflow?"* |
| **Marcus Vance** | `personal:marcus_vance` | Senior AI Research Engineer | **11 memories** | *"What is my dog's name and what is my chess rating?"* |

### How to test them:
1. Click **"Sign In"** (or your profile icon in the top right / sidebar).
2. Click any of the 3 **Demo Profiles** in the modal.
3. Open the **Memory Lens** drawer on the right to inspect all 10+ memories, their categories, relevance scores, and Walrus blob IDs.
4. Ask personal recall questions to see the bot accurately recall their specific facts.
5. Notice that switching users **completely isolates context**—Alice never recalls Bob's facts!

*(To re-seed or verify all 3 users programmatically, open `GET /api/seed`)*

---

## 🛡️ How to Enable Advanced Tools (Judges Guide)

By default, technical indicators and security tools are kept minimal for everyday users. To reveal the **Security Tab**, **Relayer Status Dot**, and **"Attack Me" Demo**:

1. Open the left sidebar.
2. In the bottom account card, toggle **"Advanced tools"** to **ON**.
3. Open the **Memory Lens** panel on the right.
4. You will now see:
   - **Relayer Status** & **Mainnet Badge** in the top bar.
   - The **Security Log** tab in the Memory Lens.
   - The **"Attack me (Demo Injection)"** button to trigger and verify the live memory firewall!

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24 LTS)
- Walrus Memory credentials from [memory.walrus.xyz](https://memory.walrus.xyz)
- Google Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd tusk-project

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in your MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID, and GOOGLE_GENERATIVE_AI_API_KEY

# Run M0 SDK smoke test
npm run smoke-test

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to explore the landing page or `http://localhost:3000/chat` to start chatting!

---

## 📄 License
MIT License. Built for Walrus Session 8.
