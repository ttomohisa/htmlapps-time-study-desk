import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { loadCore } from '../helpers/load-core.mjs';
function setup() {
  const videos = [], revoked = [], changes = [], hidden = { hidden: false };
  class Video extends EventTarget {
    constructor() { super(); this.readyState = 0; this.seeking = false; this.paused = true; this.currentTime = 0; this.error = null; this.playbackRate = 1; this.volume = 1; }
    setAttribute() {} removeAttribute() { this.src = ''; } load() {}
    pause() { this.paused = true; }
    play() { this.paused = false; return this.playResult || Promise.resolve(); }
    ready(width = 320, height = 180) { this.duration = 4; this.videoWidth = width; this.videoHeight = height; this.readyState = 3; this.seekable = { length: 1 }; this.dispatchEvent(new Event('loadeddata')); }
  }
  const doc = { get hidden() { return hidden.hidden; }, createElement() { const v = new Video(); videos.push(v); return v; } };
  const text = readFileSync('src/index.template.html', 'utf8').split('// TSD:MEDIA:BEGIN')[1].split('// TSD:MEDIA:END')[0];
  const Controller = vm.runInNewContext(`${text}\nMediaController`, {
    document: doc, TsdCore: loadCore(), AbortController, setTimeout, clearTimeout,
    URL: { createObjectURL: () => `blob:test-${videos.length}`, revokeObjectURL: url => revoked.push(url) }
  });
  const host = { children: [], replaceChildren(...children) { this.children = children; } };
  const media = new Controller(host, (controller,event) => changes.push(event));
  const file = { name: 'test.mp4', size: 100, lastModified: 1 };
  async function connect() { const ready = media.loadCandidate(file); videos.at(-1).ready(); const candidate = await ready; media.commitCandidate(candidate); return candidate; }
  return { media, videos, revoked, hidden, file, host, connect, changes };
}
test('captureTime reads currentTime and refuses empty, seeking, hidden and error states', async () => {
  const { media, hidden, connect } = setup();
  assert.equal(media.captureTime().ok, false); await connect();
  media.video.currentTime = 1.2345678;
  for (const speed of [.25, .5, 1, 2]) { media.video.playbackRate = speed; assert.equal(media.captureTime().value, 1234568); }
  media.video.seeking = true; assert.equal(media.captureTime().ok, false);
  media.video.seeking = false; hidden.hidden = true; assert.equal(media.captureTime().error.code, 'BACKGROUND');
  hidden.hidden = false; media.video.error = {}; assert.equal(media.captureTime().ok, false); media.dispose();
});
test('candidate cancellation preserves the active File, element and time', async () => {
  const { media, connect, file, revoked } = setup();
  const source = await connect(), video = media.video; video.currentTime = 2;
  const pending = media.loadCandidate(file); const rejected = assert.rejects(pending, { code: 'STALE' });
  assert.equal(media.captureTime().ok, false); media.cancelCandidate(); await rejected;
  assert.equal(media.video, video); assert.equal(video.currentTime, 2); assert.equal(media.source, source.source);
  assert.equal(media.captureTime().value, 2000000);
  assert.ok(!revoked.includes(source.url)); media.dispose();
});
test('stale_media_cannot_replace_new_source and both obsolete Blob URLs are revoked', async () => {
  const { media, file, videos, revoked } = setup();
  const a = media.loadCandidate(file), first = videos.at(-1);
  const aRejected = assert.rejects(a, { code: 'STALE' });
  const b = media.loadCandidate({...file, name: 'B.mp4'}), second = videos.at(-1);
  first.ready(); second.ready(180, 320);
  await aRejected; const selected = await b; media.commitCandidate(selected);
  assert.equal(media.video, second); assert.equal(media.source.name, 'B.mp4');
  first.dispatchEvent(new Event('error')); assert.equal(media.state, 'ready');
  assert.ok(revoked.includes('blob:test-1')); media.dispose(); assert.ok(revoked.includes('blob:test-2'));
});
test('seek_disables_capture_and_source_replacement_rejects_old_seek', async () => {
  const { media, connect, file, videos } = setup(); await connect(); const old = media.video;
  const seek = media.seekTo(1500000); const rejected = assert.rejects(seek, { code: 'STALE' });
  assert.equal(media.state, 'seeking'); assert.equal(media.captureTime().ok, false);
  const next = media.loadCandidate(file); videos.at(-1).ready(); const candidate = await next; media.commitCandidate(candidate);
  old.dispatchEvent(new Event('seeked')); await rejected;
  assert.equal(media.state, 'ready'); assert.equal(media.captureTime().value, 0); media.dispose();
});
test('old play rejection cannot report failure against a new source', async () => {
  const { media, connect, file, videos } = setup(); await connect(); let fail;
  media.video.playResult = new Promise((_, reject) => { fail = reject; }); const play = media.play();
  const next = media.loadCandidate(file); videos.at(-1).ready(); media.commitCandidate(await next);
  fail(new Error('Old decoder')); await play; assert.equal(media.state, 'ready'); assert.equal(media.video.paused, true); media.dispose();
});
test('a new play promise that resolves after background pause must not restart playback', async () => {
  const { media, connect, hidden } = setup(); await connect(); let finish;
  const old = media.video;
  old.play = () => new Promise(resolve => { finish = () => { old.paused = false; resolve(); }; });
  const playing = media.play(); hidden.hidden = true; media.pause(); finish(); await playing;
  assert.equal(old.paused, true); media.dispose();
});

test('a paused seek to the endpoint must not signal natural playback completion',async()=>{
 const {media,connect,changes}=setup();await connect();
 const seeking=media.seekTo(4000000);media.video.dispatchEvent(new Event('seeked'));await seeking;
 media.video.dispatchEvent(new Event('ended'));
 assert.ok(!changes.includes('ended'),'seeking alone must not close an active measurement');media.dispose();
});
test('natural playback completion is still signaled once',async()=>{
 const {media,connect,changes}=setup();await connect();await media.play();
 media.video.currentTime=4;media.video.dispatchEvent(new Event('ended'));media.video.dispatchEvent(new Event('ended'));
 assert.equal(changes.filter(event=>event==='ended').length,1);media.dispose();
});
