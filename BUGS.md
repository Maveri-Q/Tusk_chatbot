# TUSK: Walrus Memory & Integration Bug Tracker

This document logs all observed rough edges, SDK quirks, relayer issues, and unexpected behaviors encountered with Walrus Memory (`@mysten-incubation/memwal`). Useful for feedback and bug bounty submissions.

| ID | Component | Summary | Repro Steps / Notes | Status |
|---|---|---|---|---|
| BUG-001 | Documentation | Deletion API absence | The SDK reference specifies no individual memory deletion/revocation method; requires soft forget in metadata. | Documented |
