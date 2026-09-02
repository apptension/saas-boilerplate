const assert = require('node:assert/strict');
const { decideCommentAction, buildMarker } = require('./dedupe-review-comment');

function botComment(id, body) {
  return { id, body, user: { type: 'Bot' } };
}

// No existing bot comment -> create a new one
assert.deepEqual(decideCommentAction([], 'sha-a'), { action: 'create' });

// Existing bot comment for the same head SHA -> skip (this is the
// "repeat push, unchanged SHA" acceptance criterion)
const sameSha = [botComment(1, buildMarker('sha-a') + '\nfindings')];
assert.deepEqual(decideCommentAction(sameSha, 'sha-a'), { action: 'skip' });

// Existing bot comment for an older SHA -> edit it in place
const olderSha = [botComment(2, buildMarker('sha-old') + '\nfindings')];
assert.deepEqual(decideCommentAction(olderSha, 'sha-new'), {
  action: 'update',
  commentId: 2,
});

// A human comment that happens to start with the marker text must never
// be mistaken for the bot's own comment
const humanComment = [{ id: 3, body: buildMarker('sha-a'), user: { type: 'User' } }];
assert.deepEqual(decideCommentAction(humanComment, 'sha-a'), { action: 'create' });

console.log('dedupe-review-comment.test.js: all assertions passed');
