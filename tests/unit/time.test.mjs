import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../helpers/load-core.mjs';
test('media seconds round to safe integer microseconds, independent of playback speed', () => {
  const core = loadCore();
  assert.equal(core.toTimeUs(1.2345678).value, 1234568);
  assert.equal(core.toTimeUs(0).value, 0);
  for (const seconds of [-1, Infinity, NaN, Number.MAX_SAFE_INTEGER, '1']) assert.equal(core.toTimeUs(seconds).ok, false);
});
test('video file limits do not reject empty MIME or unknown extension', () => {
  const core = loadCore();
  assert.equal(core.validateFile({size: 1, name: 'video.unknown', type: ''}).ok, true);
  assert.equal(core.validateFile({size: 8 * 1024 ** 3}).ok, true);
  for (const size of [0, -1, 8 * 1024 ** 3 + 1, Infinity, NaN]) assert.equal(core.validateFile({size}).ok, false);
});
test('metadata rejects audio, unknown duration and recordings over 24 hours', () => {
  const core = loadCore();
  const meta = {duration: 86400, width: 180, height: 320};
  assert.equal(core.validateMetadata(meta).ok, true);
  for (const duration of [0, -1, Infinity, NaN, 86400.1]) assert.equal(core.validateMetadata({...meta, duration}).ok, false);
  assert.equal(core.validateMetadata({...meta, width: 0, height: 0}).ok, false);
});
test('output name preparation handles empty names, reserved names and path characters', () => {
  const core = loadCore();
  assert.equal(core.sanitizeFilename('', '.tsd.json'), 'time-study.tsd.json');
  assert.equal(core.sanitizeFilename('CON', '.tsd.json'), 'CON-file.tsd.json');
  assert.equal(core.sanitizeFilename('work.tsd.json', '.tsd.json'), 'work.tsd.json');
  assert.ok(!/[\\/:]/.test(core.sanitizeFilename('../work', '.tsd.json')));
});
