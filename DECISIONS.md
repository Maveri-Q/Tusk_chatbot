# TUSK: Architectural Decisions & Blueprint Deviations

This file tracks all technical decisions, library choices, and deviations from the initial blueprint specifications (`tusk-01` through `tusk-04`).

| Date | Topic | Decision | Rationale |
|---|---|---|---|
| 2026-10-07 | Node.js Environment | Node.js v24.19.0 LTS with npm 11.17.0 | Installed via winget to support Next.js App Router and Walrus SDK peer dependencies. |
| 2026-10-07 | Active Network / Relayer | `https://relayer.memory.walrus.xyz` (Mainnet) | The user's MemWalAccount object lives on Sui Mainnet; smoke test verified against mainnet relayer. |
| 2026-10-07 | Gemini Model ID | `gemini-3.8-flash` | Selected per Google AI API guidance as the current active Flash model with instant streaming. |
