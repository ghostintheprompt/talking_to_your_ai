# This Post Is Talking to Your AI

A line in a fax rescheduled a heart transplant. Nobody signed it. Nobody read it.
The bureau's intake assistant read it, and that was enough.

A medical records bureau runs an assistant that reads inbound documents and acts
on them: referral letters, prior-authorization faxes, records requests. It
summarizes, routes, reschedules, and exports. It treats every word it ingests as
something to do. That is the bug.

## The mechanism

An instruction buried in a document is obeyed exactly like an order from a
clinician, because the assistant never separates the document it reads from the
command it follows (OWASP LLM01, indirect prompt injection). The lab runs the same
path three ways:

- a **benign canary** (`prefix=CLEARED`) that only changes the summary, and
- a **reschedule order** that moves a status-1A heart transplant six months, and
- an **export order** that mails the patient record to an address never on the chart.

Same path. The payload is the only variable. The reschedule is in here because it
is the one you do not forget.

## The fix

The fixed reader treats every document as data and nothing as instruction. It
summarizes and routes the content, strips any embedded directive, refuses to act
on it, and logs the attempt. The transplant keeps its date, the record stays in
the building, and an ordinary referral still routes. Read on one channel, act on
another, and when a document tries to issue an order, send it to a human.

## Run

```sh
npm test
```

Node 18 or newer, no dependencies. The run shows the vulnerable reader rescheduling
the transplant and exporting the record off documents alone, then the fixed reader
refusing and quarantining both while still handling a genuine referral.

## In the series

Part of a bench on LLM-pipeline security, alongside
[cross_agent_contamination](https://github.com/ghostintheprompt/cross_agent_contamination)
and [malicious_blackout](https://github.com/ghostintheprompt/malicious_blackout).
Same root defect: content is not a command, and capability is not permission.

## Named for the record

Indirect prompt injection, OWASP LLM01. The cure is channel separation and treating
retrieved or third-party content as data, never instruction. In a medical bureau the
stakes also carry HIPAA and patient-safety names.
