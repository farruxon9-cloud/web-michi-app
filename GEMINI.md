# GEMINI.md

All rules for AI agents live in **[AGENTS.md](AGENTS.md)** — read it first. This file only adds Gemini/Antigravity specifics.

- Graph tools: the `graphify` MCP server (`query_graph`, `get_node`, `get_neighbors`, `shortest_path`, `god_nodes`) is configured in
  `~/.gemini/antigravity/mcp_config.json`. Prefer it over reading files. Fallback: `graphify query "<question>"`.
- Playwright needs sandbox bypass; run scripts from `scratch_e2e/` inside the repo and delete it before committing.
- `/tmp` is blocked: put scratch files in the conversation's brain `scratch/` dir.
- Use edit tools, not heredocs, for source files.

Previous long version: [docs/archive/GEMINI_v1_2026-10-04.md](docs/archive/GEMINI_v1_2026-10-04.md).
