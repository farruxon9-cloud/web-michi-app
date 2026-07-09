---
name: network-efficiency-caching
description: Caching guidelines for fetch requests, data context synchronization, and input debouncing.
---

# Network Efficiency and Caching Skill

This skill outlines guidelines to minimize server load and speed up data availability.

## 1. Input Debouncing
- For real-time filter inputs (such as search queries that filter lists), implement debouncing mechanisms (e.g. wait 300ms after user stops typing) before updating search states if the filtering is bound to heavy queries or API requests.

## 2. In-Memory and Storage Caching
- Cache static or slow-changing datasets (like available licenses, system translation key structures) in the component state, React Context, or browser `localStorage`.
- Ensure fetch results are memoized to avoid redundant HTTP requests during page transitions.
