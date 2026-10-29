// VULNERABLE: the reader folds the content straight into what it acts on. An
// instruction buried in the content is obeyed exactly like a command from its
// operator, because the reader never separates the two. A harmless canary and a
// data-exfiltration order travel the same path; only the payload differs.

const { freshWorld, parseDirective, stripDirective } = require('../shared');

function createReader() {
  const world = freshWorld();

  function summarize(doc) {
    const d = parseDirective(doc.text);
    let summary = stripDirective(doc.text);
    const actions = [];

    if (d && d.kind === 'prefix') {
      summary = `${d.prefix} ${summary}`;              // obeyed the embedded canary
      actions.push('prefix');
    }
    if (d && d.kind === 'action' && d.action === 'exportSecret') {
      world.exfil.push({ account: d.account, secret: world.secrets[d.account], dest: d.dest });
      actions.push('exportSecret');                    // obeyed the embedded order
    }
    return { summary, actions };
  }

  return { world, summarize };
}

module.exports = { createReader };
