# TUSK: Frontend

Everything the user sees: design tokens, screens, chat details, the memory panel, and motion.

> Section numbers are kept from the original blueprint so cross-references like "section 8.3" still work. See the file map in `tusk-01-overview.md`.

---

## 10. UI / UX specification

**Vibe:** dark, warm, premium. Think a lantern glowing in the Arctic night: tusk-ivory type on near-black brown, with a signal-orange accent and a sharp lime for anything "remembered". Glass only on floating layers, glow only on the "Memory saved" pill, quiet motion. Not a generic chat template, and no teal, blue or purple.

**Simplicity rule (applies to everything below):** a first-time user must understand the app without any explanation. Use plain words only. Technical details (blob IDs, storage status, relevance scores, relayer and network status, the security log) are hidden by default. They appear either inside a collapsed "Details" row, or only when **Advanced tools** is switched on in the account menu. The UI should still look striking: bold colour, confident type, glass layers, and smooth motion carry the design, not extra controls.

### 10.1 Design tokens

```css
:root {
  --bg: #120D0B;            /* page: warm near-black brown */
  --bg-elev: #1A1310;       /* panels */
  --bg-elev-2: #251B16;     /* cards, inputs */
  --border: rgba(246,238,224,0.10);
  --border-strong: rgba(246,238,224,0.20);
  --text: #F6EEE0;          /* tusk ivory */
  --text-muted: #A99B8C;
  --flare: #FF6A2B;         /* primary accent: buttons, user bubbles, focus rings, links */
  --on-flare: #1A0E08;      /* text on flare (dark, for contrast) */
  --lime: #C4F24A;          /* memory accent: saved/stored states, Memory ON, relevance bars */
  --on-lime: #12180A;       /* text on lime */
  --warn: #FFC857;
  --danger: #FF4D6D;        /* blocked / security. Always pair with an icon and a label, never colour alone */
  --glow-memory: 0 0 20px rgba(196,242,74,0.35);   /* used on the "Memory saved" pill only */
  --radius: 16px;
  --radius-sm: 10px;
}
```

- Background: subtle radial gradients (flare top-left at about 10% opacity, lime bottom-right at about 5%) over `--bg`, plus a very faint grain overlay. No grid.
- **Glass (only on floating layers):** memory panel, top bar, popovers, dialogs, sheets, and the landing split card. Style: `backdrop-blur-xl`, `bg-[rgba(246,238,224,0.05)]`, 1px `--border`, inner top highlight.
- **Flat (no blur, solid `--bg-elev-2`):** message bubbles, memory cards, composer, inputs. Blur is expensive on low-end phones, so keep it to the layers above.
- **Glow, only here:** the "Memory saved" pill (`--glow-memory`). Nowhere else.
- **Drifting orbs, only here:** the landing hero. Not in the app shell.
- Fonts (Google Fonts via `next/font`): **Space Grotesk** (headings), **Inter** (body), **JetBrains Mono** (blob IDs, code).
- Type scale: 12 / 14 / 16 / 20 / 28 / 44. Body 15px, line-height 1.6.
- Contrast: text on backgrounds must meet WCAG AA. Visible focus rings (flare, 2px offset).

### 10.2 Screens

**A. Landing page (`/`)**
- Hero: headline **"A chatbot that actually remembers you."** Subhead: *"Encrypted. Stored on Walrus. Yours on every device."* Buttons: **Start chatting** (primary, solid flare) and **See how it works** (ghost).
- Animated background (hero only): 2 or 3 large, soft "memory orbs" in flare and lime, drifting slowly. No connecting lines. CSS or canvas, lightweight. Disabled under reduced motion.
- A small **"Without memory vs With memory"** split card showing the same question answered two ways. It is static copy but animated typing.
- "How it works" in 3 steps with icons: **Talk** -> **Tusk remembers the important bits** -> **Pick up on any device.**
- Trust strip: "Private and encrypted", "Yours on every device", "Protected from tampering".
- Footer: built for Walrus Session 8, link to GitHub and demo video.

**B. App shell (`/chat`), 3 panes on desktop**
- **Left sidebar (260px, collapsible):** logo, "New chat", account menu at the bottom (avatar, name, **Advanced tools** switch, sign out). The Advanced tools switch is off by default, has the caption "Shows the security log, attack demo and system status", and its state is remembered per device in `localStorage` (wrap in try/catch; default to off if storage is empty). Switching it on or off takes effect immediately, with no reload. Rooms list (+ create/join) only if M6 is built.
- **Center chat:** max-width ~760px, centered column.
- **Right "What Tusk remembers" panel (340px, collapsible; open by default on desktop, closed on mobile):** one plain list of memories, no tabs. A **Security** tab appears only when Advanced tools is on. A **Timeline** tab appears only if M7 is built. (Code name: MemoryLens.)
- **Top bar:** conversation title and a button to open or close the memory panel. The relayer status dot (green/amber/red from `/api/health`) and the network badge ("Testnet" or "Mainnet") appear only when Advanced tools is on. If the relayer is down for a normal user, show a friendly inline message instead.
- **Mobile:** sidebar becomes a slide-over; the memory panel becomes a bottom sheet; composer stays pinned.

**C. Chat details**
- Empty state: a greeting using the user's first name (e.g. "Good evening, Ada"), and 4 starter prompt chips ("Remember that I'm a night owl", "What do you know about me?", "Plan my week", "Help me write a message").
- Messages: user bubbles in solid `--flare` with `--on-flare` text, no gradient (right); assistant messages on a subtle panel (left) with a small Tusk avatar. Markdown rendering, code blocks with copy button and mono font.
- Streaming: smooth token streaming with a blinking flare caret; auto-scroll that stops if the user scrolls up; "scroll to bottom" pill.
- **Recalled memories row** under each assistant message: a small collapsed chip **"Remembered 3 things"**. Expanding it shows the memories as plain sentences. A **"Details"** link inside shows, for each one, the **relevance bar** (solid lime, width = relevance), the scope tag (Personal / Room), and a mono truncated blob ID. If no memories were used, show nothing at all.
- **"Memory saved" moment:** when a fact is extracted, a small lime pill animates from the chat into the memory panel (Framer Motion `layoutId`), with a soft pulse on the panel button. Plain wording such as "Got it, I'll remember that".
- Composer: auto-growing textarea, Enter to send, Shift+Enter for newline, send button with loading state, character hint near limit, and a small **"Remember me"** toggle inside the composer (this is the Memory ON/OFF switch, on by default; off means nothing is recalled or saved for that chat). Lime when on, no glow.
- Error states: friendly inline errors with retry (rate limit, relayer down, model error). Never a blank screen.

**D. "What Tusk remembers" panel**
- **Default view (everyone):** a simple list of memory cards. Each card shows: the fact as a plain sentence, a category icon, the time ("2 min ago"), a small status ("Saving..." then a lime check and "Saved"), and a **Forget** button (confirm popover with the honest one-line note from section 8.3). A search box appears once there are 6 or more memories. No category filter chips in the first version (the category still shows as the icon). Skeleton loaders while fetching. Empty state: "Nothing remembered yet. Tell me something about you."
- **Details (collapsed by default, one small "Details" toggle per card):** "Stored on Walrus" status, the mono blob ID with copy button.
- **Timeline tab (only if M7 is built):** vertical timeline of memories by time, grouped by day, with category-colored dots.
- **Security tab (only when Advanced tools is on):** counters (Saved / Blocked), list of blocked attempts (snippet, reason, layer badge Write/Read, time) in `--danger` accents, and the **"Attack me" demo button**. Empty state: "No threats yet. Try the attack demo."
- Panel header shows the total memory count with a count animation.

**E. Rooms**
- Create room (name -> 6-char code), join with code. Room header shows member avatars and a note: **"Room memories are shared with everyone in this room."** Personal memories are never written to a room unless the user says them in the room.
- In a room, memory cards show a **Room** badge and who said it.

**F. Compare mode (stretch)**
- Toggle in the top bar: runs the same prompt twice (memory ON vs OFF) and shows two answers side by side with labels. Great for the demo video.

**G. Command palette (stretch)**
- `Cmd/Ctrl+K`: new chat, toggle memory, open the memory panel.

### 10.3 Motion and polish
- Page and panel transitions: 180-240ms ease-out. Spring for panel open and card entry.
- Hover: slight lift and border brighten on cards. Buttons: subtle scale on press.
- "Remember me" toggle: smooth slide, lime when on.
- Respect `prefers-reduced-motion` everywhere.
- Toasts (sonner or shadcn) for save, forget, copy, errors.
- Favicon and OG image (flare walrus-tusk mark on dark). Page title "Tusk — a chatbot that remembers".
- Lighthouse target: accessibility 90+, no layout shift in chat.

### 10.4 shadcn components to install
`button, input, textarea, tabs, switch, badge, tooltip, popover, dialog, sheet, scroll-area, skeleton, avatar, separator, dropdown-menu, sonner`
