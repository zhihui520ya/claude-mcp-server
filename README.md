# Claude Code MCP Server for Codex CLI

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that lets **Codex CLI** call **Claude Code** for help with complex reasoning, architecture analysis, and ambiguous tasks.

## Features

- **`ask_claude`** — One-shot questions to Claude Code (no context)
- **`ask_claude_session`** — Multi-turn conversations with full context memory
- **`reset_claude_session`** — Clear session memory when switching projects
- Auto-retry on timeout
- Supports code/file context alongside questions

## Installation

```bash
# Add to Codex CLI
codex mcp add claude-helper -- node /path/to/claude-mcp-server.js
```

Requires `claude` CLI (or `cc-haha`) to be in PATH.

## Usage from Codex

```json
// Simple question
ask_claude("What does this error mean?")

// With code context
ask_claude(
  question="Is there a bug here?",
  code="function foo() { return bar; }"
)

// Multi-turn analysis
ask_claude_session(question="Analyze this architecture")
ask_claude_session(question="How does the database fit in?")
ask_claude_session(question="What about caching?")

// Switch topics
reset_claude_session(reason="Switching to a new project")
```

## License

MIT
