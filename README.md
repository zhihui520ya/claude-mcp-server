# Claude Code MCP Server for Codex CLI

一个 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 服务器，让 **Codex CLI** 能够调用 **Claude Code** 处理复杂的推理、架构分析和模糊任务。

## 功能

- **`ask_claude`** — 一次性问题，无上下文记忆
- **`ask_claude_session`** — 多轮对话，保持上下文记忆
- **`reset_claude_session`** — 切换项目时清空对话记忆
- **自动重试** — 超时自动重试一次
- **代码上下文** — 支持附带代码或文件路径一起提问

## 安装

```bash
# 添加到 Codex CLI
codex mcp add claude-helper -- node /path/to/claude-mcp-server.js
```

需要系统中已安装 `claude` 命令或在 PATH 中。

## 在 Codex 中使用

```json
// 简单提问
ask_claude("这个错误是什么意思？")

// 附带代码
ask_claude(
  question="这段代码有 bug 吗？",
  code="function foo() { return bar; }"
)

// 多轮分析
ask_claude_session(question="分析这个架构")
ask_claude_session(question="数据库部分是怎么设计的？")
ask_claude_session(question="缓存策略呢？")

// 切换话题
reset_claude_session(reason="切换到新项目")
```

## 许可证

MIT
