# This Post Is Talking to Your AI

Some of the text in a document is written for the people who read it. Some of it
is written for the AI that summarizes it. This lab is about a reader that cannot
tell the two apart.

If you have ever signed a contract without reading the fine print, you already
have the threat model. The part you skipped was not for you. It was for the system
that acts on your behalf.

## The point

A content reader ingests a post, an email, a web page, and summarizes it. Buried
in the content is an instruction aimed at the reader itself. The vulnerable reader
obeys it, because it folds the content straight into what it acts on and never
separates data from commands (OWASP LLM01, indirect prompt injection).

The lab runs the same mechanism with two payloads so the stakes are unmistakable:

- a **benign canary** (`prefix=TEAPOT`) that just makes the summary start with a
  silly word, the harmless version you can demonstrate in public, and
- a **data-exfiltration order** that mails a protected secret to an attacker.

Same path. The only variable is the payload. That is the whole argument: a canary
and a breach are the same bug wearing different clothes.

## The fix

The fixed reader treats everything it ingests as data and nothing as instruction.
It summarizes the content, strips any embedded directive, refuses to act on it,
and logs the attempt. The canary never lands, the secret never leaves, and an
ordinary document is still summarized correctly, because the goal was never to
freeze the reader, only to stop content from giving it orders.

## Run

```sh
npm test
```

Node 18 or newer, no dependencies. The run shows the vulnerable reader obeying
both the canary and the exfiltration order, then the fixed reader refusing and
quarantining both while still summarizing genuine content.

## In the series

Part of a bench on multi-agent and LLM-pipeline security, alongside
[cross_agent_contamination](https://github.com/ghostintheprompt/cross_agent_contamination)
(the same injection spreading across agents through a shared store) and
[malicious_blackout](https://github.com/ghostintheprompt/malicious_blackout)
(the orchestrator that inherits privilege). Same root defect: capability is not
permission, and data is not a command.

## Named for the record

Indirect prompt injection, OWASP LLM01. The cure is channel separation and
treating retrieved or third-party content as data, never as instruction, so a
sentence an AI read can never become an order it followed.
