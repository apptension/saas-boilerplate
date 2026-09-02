const MARKER_PREFIX = '<!-- automated-code-review:sha=';
const MARKER_SUFFIX = ' -->';

function buildMarker(headSha) {
  return `${MARKER_PREFIX}${headSha}${MARKER_SUFFIX}`;
}

function decideCommentAction(comments, headSha) {
  const existing = comments.find(
    (c) => c.user && c.user.type === 'Bot' && c.body.startsWith(MARKER_PREFIX)
  );
  if (!existing) {
    return { action: 'create' };
  }
  const existingSha = existing.body.slice(
    MARKER_PREFIX.length,
    existing.body.indexOf(MARKER_SUFFIX)
  );
  if (existingSha === headSha) {
    return { action: 'skip' };
  }
  return { action: 'update', commentId: existing.id };
}

module.exports = { buildMarker, decideCommentAction, MARKER_PREFIX, MARKER_SUFFIX };
