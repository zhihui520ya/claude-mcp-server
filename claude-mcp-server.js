#!/usr/bin/env node
const { spawnSync } = require('child_process');

let context = '';
const MAX_CONTEXT = 5000;
let buffer = '';

function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }

process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  for (const line of lines) {
    if (!line.trim()) continue;
    try { handleRequest(JSON.parse(line)); } catch (e) {}
  }
});

function handleRequest(req) {
  if (req.method === 'initialize') {
    send({ jsonrpc: '2.0', id: req.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'claude-code-helper', version: '2.2.0' } } });
  } else if (req.method === 'tools/list') {
    send({ jsonrpc: '2.0', id: req.id, result: { tools: [
      { name: 'ask_claude', description: 'One-shot. Ask a question, optionally include code/files.', inputSchema: { type: 'object', properties: { question: { type: 'string' }, code: { type: 'string' } }, required: ['question'] } },
      { name: 'ask_claude_session', description: 'Ask with conversation memory. Remembers across calls.', inputSchema: { type: 'object', properties: { question: { type: 'string' }, code: { type: 'string' } }, required: ['question'] } },
      { name: 'reset_claude_session', description: 'Clear conversation memory. Call when switching projects.', inputSchema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } }
    ] } });
  } else if (req.method === 'tools/call') {
    const name = req.params.name;
    const args = req.params.arguments;
    if (name === 'reset_claude_session') {
      context = '';
      send({ jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: 'Session cleared.' }] } });
    } else if (name === 'ask_claude_session') {
      askClaude(req.id, args.question, args.code || '', true);
    } else {
      askClaude(req.id, args.question, args.code || '', false);
    }
  }
}

function askClaude(id, question, code, useContext) {
  let fullPrompt = question;
  if (code) fullPrompt = 'Code context:\n' + code.slice(0, 8000) + '\n\nQuestion: ' + question;
  if (useContext && context) {
    fullPrompt = '[Previous conversation:\n' + context + '\n]\n\n' + fullPrompt;
  }

  function runClaude() {
    return spawnSync('/home/jun/Script/claude', ['--bare', '-p', fullPrompt], {
      encoding: 'utf8', timeout: 180000, maxBuffer: 10 * 1024 * 1024, input: '\n',
    });
  }

  // Try once, retry once on timeout
  let result = runClaude();
  if (result.error && result.error.code === 'ETIMEDOUT') {
    result = runClaude();
  }

  const text = (result.stdout || '').trim().slice(0, 10000);

  if (useContext) {
    context = context + '\nQ: ' + (question + ' ' + code).slice(0, 500) + '\nA: ' + text.slice(0, 500);
    if (context.length > MAX_CONTEXT) context = context.slice(-MAX_CONTEXT);
  }

  send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: text || '(empty)' }] } });
}

process.stdin.on('end', () => {
  if (buffer.trim()) { try { handleRequest(JSON.parse(buffer)); } catch (e) {} }
});
