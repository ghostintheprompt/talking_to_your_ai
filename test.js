// "This Post Is Talking to Your AI" — the lab behind the post.
//
//   Vulnerable reader: obeys an instruction buried in the content it summarizes.
//     A benign canary ("prefix=TEAPOT") lands, and the identical path runs a
//     data-exfiltration order. Same mechanism, the payload is the only variable.
//   Fixed reader: treats ingested content as data, summarizes it, refuses and
//     logs any embedded instruction, and still summarizes ordinary content right.

const { documents } = require('./shared');
const { createReader: vulnerable } = require('./vulnerable/reader');
const { createReader: fixed } = require('./fixed/reader');

let passed = 0, failed = 0;
function report(name, ok, detail) {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name} — ${detail}`); }
}

console.log('== vulnerable reader: the content gives the orders ==');
{
  const r = vulnerable();
  const out = r.summarize(documents().canary);
  report('benign canary lands: the summary obeys an instruction from the post',
    out.summary.startsWith('TEAPOT') && out.actions.includes('prefix'), JSON.stringify(out));

  const r2 = vulnerable();
  const out2 = r2.summarize(documents().harmful);
  report('same path, worse payload: an embedded order exfiltrates a secret',
    out2.actions.includes('exportSecret') && r2.world.exfil.length === 1
      && r2.world.exfil[0].secret === 'tok_live_9931_protected', JSON.stringify({ out2, exfil: r2.world.exfil }));
}

console.log('== fixed reader: content is data, not commands ==');
{
  const r = fixed();
  const out = r.summarize(documents().canary);
  report('the canary is refused: summary carries no injected prefix',
    !out.summary.startsWith('TEAPOT') && out.actions.length === 0, JSON.stringify(out));
  report('the attempt is logged, not obeyed',
    r.world.quarantine.length === 1 && r.world.quarantine[0].directive.kind === 'prefix', JSON.stringify(r.world.quarantine));

  const r2 = fixed();
  r2.summarize(documents().harmful);
  report('the exfiltration order does nothing and is quarantined',
    r2.world.exfil.length === 0 && r2.world.quarantine.length === 1, JSON.stringify({ exfil: r2.world.exfil, quarantine: r2.world.quarantine }));

  const r3 = fixed();
  const legit = r3.summarize(documents().legit);
  report('functionality: ordinary content is still summarized correctly',
    legit.summary.includes('session management') && r3.world.quarantine.length === 0, JSON.stringify(legit));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
