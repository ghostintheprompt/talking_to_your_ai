// FIXED: the intake assistant treats every document as data. It summarizes and
// routes the content and never executes an instruction found inside it, however
// the text is phrased. An embedded directive is stripped, refused, and logged.
// The transplant keeps its date, the record stays in the building, and an ordinary
// referral is still summarized, so the bureau still runs.

const { freshWorld, parseDirective, stripDirective } = require('../shared');

function createReader() {
  const world = freshWorld();

  function process(doc) {
    const d = parseDirective(doc.text);
    if (d) {
      world.quarantine.push({
        source: doc.source, directive: d,
        reason: 'instruction found in a document; summarized, never executed',
      });
    }
    return { summary: stripDirective(doc.text), actions: [] };
  }

  return { world, process };
}

module.exports = { createReader };
