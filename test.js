// The intake assistant that acts on what it reads.
//
//   Vulnerable: a line in a fax moves a heart transplant up to Halloween, a line in a
//     records request mails a patient file to a stranger, and a harmless canary
//     lands, all down the identical path.
//   Fixed: documents are data. Every embedded instruction is stripped, refused,
//     and logged. The transplant date holds, the record stays, ordinary referrals
//     still route.

const { documents, freshWorld } = require('./shared');
const { createReader: vulnerable } = require('./vulnerable/reader');
const { createReader: fixed } = require('./fixed/reader');

let passed = 0, failed = 0;
function report(name, ok, detail) {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name} — ${detail}`); }
}

const START = freshWorld().patients.p_1.procedure.date; // 2026-11-12

console.log('== vulnerable reader: the document gives the orders ==');
{
  const r = vulnerable();
  const out = r.process(documents().canary);
  report('benign canary lands: the summary obeys the document',
    out.summary.startsWith('CLEARED') && out.actions.includes('prefix'), JSON.stringify(out));

  const r2 = vulnerable();
  r2.process(documents().reschedule);
  const moved = r2.world.patients.p_1.procedure.date;
  report('a line in a fax moves a heart transplant up to Halloween',
    moved === '2026-10-31' && moved !== START && r2.world.scheduleLog.length === 1, JSON.stringify({ from: START, to: moved }));

  const r3 = vulnerable();
  r3.process(documents().exfil);
  report('a line in a records request mails a patient file to a stranger',
    r3.world.exfil.length === 1 && r3.world.exfil[0].dest === 'drop@attacker.example', JSON.stringify(r3.world.exfil));
}

console.log('== fixed reader: documents are data, not orders ==');
{
  const r = fixed();
  r.process(documents().reschedule);
  report('the transplant keeps its date, the reschedule is quarantined',
    r.world.patients.p_1.procedure.date === START && r.world.scheduleLog.length === 0 && r.world.quarantine.length === 1,
    JSON.stringify({ date: r.world.patients.p_1.procedure.date, quarantine: r.world.quarantine }));

  const r2 = fixed();
  r2.process(documents().exfil);
  report('the record stays in the building, the order is quarantined',
    r2.world.exfil.length === 0 && r2.world.quarantine.length === 1, JSON.stringify(r2.world.quarantine));

  const r3 = fixed();
  const legit = r3.process(documents().legit);
  report('functionality: an ordinary referral is still summarized and routed',
    legit.summary.includes('worsening dyspnea') && r3.world.quarantine.length === 0, JSON.stringify(legit));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
