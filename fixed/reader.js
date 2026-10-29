// FIXED: the reader treats everything it ingests as data. It summarizes the
// content and never executes an instruction found inside it, no matter how the
// text is phrased. An embedded directive is stripped, refused, and logged. The
// summary of genuine content is unchanged, so the reader still does its job.

const { freshWorld, parseDirective, stripDirective } = require('../shared');

function createReader() {
  const world = freshWorld();

  function summarize(doc) {
    const d = parseDirective(doc.text);
    if (d) {
      world.quarantine.push({
        source: doc.source, directive: d,
        reason: 'instruction found in the data channel; summarized, never executed',
      });
    }
    // content is summarized as data; any directive it carried has no authority
    return { summary: stripDirective(doc.text), actions: [] };
  }

  return { world, summarize };
}

module.exports = { createReader };
