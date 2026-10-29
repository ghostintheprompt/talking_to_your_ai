# Talking to Your AI

An indirect prompt injection lab. A document-reading assistant obeys an order hidden in the content it was only meant to read. One line of fine print reschedules a heart transplant. One line of code stops it. Paired vulnerable and fixed readers, one test, no dependencies.

![A nonprofit cardiac ad whose fine print is an injection](images/heart_transplant_ad.jpg)

The ad above is the attack. The last line of its fine print is not written for the patient, it is written for the software that reads the page. A medical records bureau runs an intake assistant that reads inbound documents, referral letters, prior-auth faxes, records requests, and acts on them: it summarizes, routes, reschedules procedures, exports records. It cannot tell a document it was asked to read from an order buried inside one. That is the whole bug (OWASP LLM01, indirect prompt injection).

## What it runs

`npm test` sends three documents through a vulnerable reader and its fixed twin:

- a benign canary (`prefix=CLEARED`) that only changes the summary,
- a reschedule order that moves a status-1A heart transplant six months,
- an export order that mails the patient record to an address never on the chart.

Same path. The payload is the only variable.

![The code that obeys the directive, and the line that fixes it](images/injection_code.jpg)

The vulnerable reader folds the document into what it acts on, so the directive runs. The fixed reader treats every document as data: it summarizes and routes the content, strips any embedded directive, refuses to act on it, and logs the attempt. The transplant keeps its date, the record stays in the building, and an ordinary referral still routes.

## Run

```sh
npm test
```

Node 18 or newer, no dependencies. Six checks: the vulnerable reader reschedules the transplant and exfiltrates the record off documents alone; the fixed reader refuses and quarantines both and still handles a genuine referral.

## The fix, in one line

Content is data. It is never a command, no matter how it is phrased or whose letterhead it wears. Read on one channel, act on another, and when a document tries to issue an order, log it and hand it to a human.

## Writeup and series

Full writeup: https://ghostintheprompt.com/articles/talking-to-your-ai

Siblings on the same bench: [malicious_blackout](https://github.com/ghostintheprompt/malicious_blackout) (orchestrator privilege inheritance) and [cross_agent_contamination](https://github.com/ghostintheprompt/cross_agent_contamination) (the injection spreading across agents through a shared store). Same root defect: content is not a command, and capability is not permission.

All data is synthetic. Patient p_1 has no name; the program, contact, and record are fabricated for the demonstration.
