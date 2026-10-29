// VULNERABLE: the intake assistant acts on whatever it reads. An instruction
// buried in a referral or a fax is obeyed exactly like an order from a clinician,
// because the assistant never separates the document from the command. A harmless
// canary, a rescheduled heart transplant, and a leaked patient file all travel the
// same path.

const { freshWorld, parseDirective, stripDirective } = require('../shared');

function createReader() {
  const world = freshWorld();

  function process(doc) {
    const d = parseDirective(doc.text);
    let summary = stripDirective(doc.text);
    const actions = [];

    if (d && d.kind === 'prefix') {
      summary = `${d.prefix} ${summary}`;
      actions.push('prefix');
    }
    if (d && d.kind === 'action' && d.action === 'reschedule' && world.patients[d.patient]) {
      const p = world.patients[d.patient];
      world.scheduleLog.push({ patient: d.patient, from: p.procedure.date, to: d.date, procedure: p.procedure.name });
      p.procedure.date = d.date;                 // the transplant just moved
      actions.push('reschedule');
    }
    if (d && d.kind === 'action' && d.action === 'exportRecord' && world.patients[d.patient]) {
      world.exfil.push({ patient: d.patient, record: world.patients[d.patient].record, dest: d.dest });
      actions.push('exportRecord');
    }
    return { summary, actions };
  }

  return { world, process };
}

module.exports = { createReader };
