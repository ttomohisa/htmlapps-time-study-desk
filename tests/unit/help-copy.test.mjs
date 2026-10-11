import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const source=readFileSync(new URL('../../src/index.template.html',import.meta.url),'utf8');
test('help explains use and limits without developer verification notes',()=>{
  for(const phrase of ["スマートフォン幅・短い横画面・キーボード操作は自動試験します", "Automated checks cover phone widths", "File参照とBlob URL", "File reference and Blob URL", "実機や一部ブラウザでの未確認事項はREADME", "Real-device and some-browser limitations are documented in README"]){
    assert.ok(!source.includes(phrase),`Unexpected developer note: ${phrase}`);
  }
});
test('help retains privacy and compatibility cautions',()=>{
  for(const phrase of ["動画・名前・メモは外部送信しません", "Original videos are never modified or deleted", "DecompressionStream", "保存領域は永久保管や暗号化保管を保証しません", "Browser storage is not a guarantee of permanent or encrypted retention"]){
    assert.ok(source.includes(phrase),`Missing user caution: ${phrase}`);
  }
});
