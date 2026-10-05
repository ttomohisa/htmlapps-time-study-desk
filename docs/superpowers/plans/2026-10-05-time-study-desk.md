# Time Study Desk — 開発計画 / Implementation Plan

> **実装担当エージェント向け:** この計画を実行する場合は、利用可能な環境に応じて `superpowers:subagent-driven-development` または `superpowers:executing-plans` を読み、タスク単位で実行する。本依頼は仕様書と計画の作成までであり、実装開始・リポジトリ作成・マージの指示ではない。

**Goal:** 動画を工程・回ごとに手動で区切り、根拠映像へ戻れる時間表を、外部送信なしで作成・保存・再開できるアプリをv1.0.0まで段階開発する。\
**Architecture:** テンプレートの単一編集元HTMLを維持し、純粋なデータ処理、メディア制御、永続化、描画を明確なブロックへ分離する。集計・出力は同じ派生データを使用し、境界を共有して区間重複と隙間を防ぐ。\
**Tech Stack:** HTML、CSS、JavaScript、HTMLMediaElement、File／Blob URL、IndexedDB、SVG。実行時第三者ライブラリなし。開発時のみNodeのテストランナーとPlaywrightを使用する。\
**Spec:** リポジトリルートの [APP_SPEC.md](../../../APP_SPEC.md)、文書版1.0、2026-10-05。実装前に全体を読む。\
**計画版:** 1.0。各チェックは未実施として開始する。

## 全体制約

- 一つの作業対象、一本の動画、順次工程。並行作業・複数動画・AI・動画変換を入れない。
- 主色 `#16624F`、ライトUIのみ、日本語と英語を同じHTMLに含める。SVGを使う。
- ランタイム外部依存・CDN・フォント・analytics・telemetry・API通信なし。`connect-src 'none'`。
- 動画と分析データを外部送信しない。手動出力もローカルファイルのみ。
- 時刻は `Math.round(currentTime * 1_000_000)` の安全な整数。内部単位を計測精度と同一視しない。
- 完了回は `全体=記録済み工程+中断+未観測`。工程別平均を合計して全体平均にしない。
- 実施なし・未観測・手順外・未完了を0秒にしない。手動除外は回全体、理由必須。
- 動画は8 GiB・24時間以下、分析JSONは10 MiB以下。工程50、手順20、回1,000、区間10,000。詳細は仕様9.4。
- 保存スキーマは `format: time-study-desk`、`schemaVersion: 1`。アプリ版と分ける。
- 通常版、自己展開版、設定から命名したルートコピーをビルドする。生成HTMLを直接編集しない。
- 320pxから主用途を成立させる。スマートフォンをv0.8.0まで未対応にしてよいという計画ではない。
- 既存対象がある場合は現在状態を読む。別ブランチ・未コミット変更を消さない。
- Browser Kitty本体を変更しない。新規・更新PRはユーザーがマージする。
- 試験未実施、実機なし、通信未確認を合格として報告しない。

## レビュー重点

| 失敗しやすい条件 | 期待する挙動 | 担当タスク |
|---|---|---|
| ソースA読込直後にBへ交換、Aの遅延イベントが到着 | AがBの表示・保存を変更しない | T02、T17 |
| 工程を飛ばす、やり直す、一部が見えない | 時間を失わず、平均の母集団を誤らない | T07、T11 |
| 動画末尾・画面ロック・バックグラウンド復帰 | 完了の自動推定をせず、確定記録を保持する | T07、T15 |
| 自動保存失敗・別タブ更新・保存済み動画の取り違え | 失敗を示し、旧データを壊さず手動保存可能 | T09、T10 |
| 日本語の長い名称、数式文字列、狭いスマートフォン | 安全な出力と崩れない主経路を維持する | T13、T14、T15 |

---

## 1. バージョンの区切り

カレンダー上の期間や完了日を固定せず、各段階の終了条件で進める。

| バージョン | 主題 | その段階で利用者ができること | タスク |
|---|---|---|---|
| v0.1.0 | Foundation / Video | ローカル動画を開き、再生・移動する | T01–T02 |
| v0.2.0 | First Measurement | 一回を区切り、直し、途中の分析を保存する | T03–T04 |
| v0.3.0 | Repeat / Procedure | 同じ手順で複数回計測し、条件を保つ | T05–T06 |
| v0.4.0 | Exceptions / Editing | 中断・未観測・実施なしを正しく記録し、修正する | T07–T08 |
| v0.5.0 | Save / Resume | 保存データと元動画から再開し、自動保存を使う | T09–T10 |
| v0.6.0 | Results / Review | 件数付きの時間表・統計から映像を確認する | T11–T12 |
| v0.7.0 | CSV / Export | 時間表・集計・明細を安全なCSVで保存する | T13–T14 |
| v0.8.0 | Mobile / Accessibility | スマートフォン・キーボード・日英で主経路を仕上げる | T15–T16 |
| v0.9.0 | Release Candidate | 機能を凍結して、データ・通信・実機・性能を検証する | T17–T18 |
| v1.0.0 | Release | 回帰と成果物整合を確認した正式版を用意する | T19–T20 |

各段階でソース、版、CHANGELOG、関連するREADME・ヘルプ・テストを一緒に更新する。未実装ボタンを有効そうに表示しない。v0.2.0から途中保存を提供し、v0.5.0で初めて保存できる構成にはしない。

同段階の不具合修正は `v0.n.1` 以降で行う。各版を毎回公開・タグ付けすることは必須ではない。Draft PR内のレビュー可能な区切りとして運用できる。

---

## 2. 初期化と変更するファイル

### 2.1 着手前の読み取り

実装開始時に対象リポジトリを確定し、現在のブランチ・作業ツリー・HEADを確認する。新規の場合はその時点の `ttomohisa/htmlapps-template` を確認する。本書の参照コミットは `cb908779682fa315ccd0f1eb58549f6c208f36f0` だが、最新との差を無視して古いテンプレートを固定コピーしない。

対象リポジトリが指定されていない段階で、既存リポジトリを消去して新規化しない。リポジトリ名案は `htmlapps-time-study-desk`。既に同名が存在すれば現在実装を調査して計画へ反映する。

現在のテンプレートで読む順は `AGENTS.md` → `APP_SPEC.md` → `docs/ARCHITECTURE.md` → `docs/LLM_WORKFLOW.md` → 関連 `components/` → 現在ソース。実装ブランチの採用案は `feat/time-study-desk-v1`。ユーザー指定のブランチがあればそちらを優先する。

### 2.2 予定ファイル

以下は新規アプリへの適用予定であり、今回すでに作成された実装ファイルではない。実装開始時のテンプレート差分でパスが変わっていれば、この表とタスクを先に訂正する。

| パス | 役割・扱い |
|---|---|
| `APP_SPEC.md` | 本仕様の正。更新 |
| `app.config.json` | アプリ名、slug、版、リポジトリ、ビルド予算。更新 |
| `src/index.template.html` | アプリ本体。APP領域を変更し、基盤契約を保持 |
| `assets/favicon.svg` | アイコンの正。更新 |
| `README.md`, `README.ja.md`, `CHANGELOG.md`, `SECURITY.md` | 実装と同時更新 |
| `dependencies.json`, `dependencies.lock.json`, `THIRD_PARTY_NOTICES.md` | 実行時依存ゼロを確認し、必要な整合を更新 |
| `package.json`, `package-lock.json` | 新規の開発専用テスト環境。正確な版をロック |
| `playwright.config.mjs` | 新規。ブラウザ・端末・file/HTTP試験プロジェクト |
| `scripts/run-unit-tests.mjs` | 新規。unit配下のtest.mjsを列挙してNode testへ渡す |
| `tests/helpers/load-core.mjs` | 新規。実ソースCOREブロックを抽出しテストへ渡す |
| `tests/helpers/fixtures.mjs` | 新規。仕様のF1〜F6と小さいプロジェクトの生成 |
| `tests/fixtures/time-studies.json` | 新規。固定の期待値と入力データ |
| `tests/fixtures/media/` | 新規。小さい権利処理済み動画・破損素材と説明 |
| `tests/helpers/app.mjs` | 新規。ブラウザ試験の起動・素材選択・UI操作 |
| `tests/unit/*.test.mjs` | 新規。純粋処理・不変条件・入出力のテスト |
| `tests/e2e/*.spec.mjs` | 新規。生成HTMLのブラウザテスト |
| `.github/workflows/test-app.yml` | 新規。既存ビルドに加えるアプリ試験。既存CIを置換しない |
| `docs/QA_MATRIX.md`, `docs/QA_RESULTS.md` | 新規。試験条件と証跡。未実施は未実施と記録 |
| `docs/SAVE_FORMAT.md`, `docs/CSV_FORMAT.md` | 新規。保存・出力契約の説明。本仕様と同期 |
| `assets/screenshot.png`, `assets/screenshot-en.png`, `assets/screenshot-mobile.png` | 実アプリの画像。v0.9以降更新 |
| `dist/*`, ルートの生成HTML | ビルド生成物。編集しない |

### 2.3 共通の試験補助契約

`loadCore()` は実装HTMLの `TSD:CORE:BEGIN/END` の一組だけを読み、Nodeの隔離コンテキストで `TsdCore` を取得する。DOMやタイマーへ依存する処理がCOREへ混入した場合は失敗させる。抽出した内容をテスト用に書き換えない。

`makeFixture(id)` は仕様付録Aの `F1`〜`F6` に対応するProjectを返す。`makeSmallProject()` は動画長60秒、二工程、手順ID `procedure-1`、工程ID `phase-1 / phase-2` を持つ未計測Project。`createTestContext()` は決定的IDと固定ISO日時を返す。

ブラウザ補助 `openApp(page, variant)` は生成HTMLの通常版または自己展開版を開く。`selectFixtureVideo(page, name)` は試験素材のファイル選択を行う。機能検証のために本番UIへ隠し機能を追加しない。COREの直接テストと、公開UIだけを使うE2Eを分ける。

---

## 3. 検証コマンドの契約

### 3.1 テンプレートの既存コマンド

参照コミットで入口の存在と実行順を確認した。実装開始時にも引数・環境を再確認する。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

PowerShell 7の環境では `pwsh -NoProfile -File ./scripts/check-powershell-syntax.ps1` と `pwsh -NoProfile -File ./scripts/check-repository.ps1` を使う。構文・エンコーディング検査を先に行う。後者は既存のビルド・成果物検証を含む。Windows PowerShell 5.1の互換性も別に確認する。

合格はプロセス終了0、チェック完了、生成物が揃い、ルートコピー一致が確認できること。文字列がログにあるだけで合格扱いにしない。

### 3.2 T01で追加するコマンド

```text
npm ci
npm run test:unit
npm run test:e2e -- --project=chromium
npm run test:e2e
```

`test:unit` は `node scripts/run-unit-tests.mjs`、`test:e2e` は `playwright test`。テスト依存は初期化時に公式公開情報から採用版を確認し、package.jsonのexact版とpackage-lockへ記録する。未知のバージョンをこの文書で捏造しない。利用者がアプリを使う際にnpmは不要。

開発環境の初回ブラウザ取得はランタイム通信とは別で記録する。試験本体は生成HTMLを対象とし、srcテンプレートを開いて成功扱いにしない。

### 3.3 全タスク共通の進め方

各タスクで失敗する試験を先に追加し、その失敗理由が当該未実装／不具合であることを確認する。最小の実装で通し、関連ユニット・生成HTML・日英狭幅の回帰を実施する。既存試験の削除・期待値の恣意的変更で通さない。

各タスクを独立レビューできるコミットにする。小さな内部修正で版を乱発せず、その段階の納品時に対応するv0.n.0を揃える。PRを自動マージしない。

---

## 4. v0.1.0 — Foundation / Video

### T01: テンプレート適用とテストの入口

**要件:** R01、R02、R21。\
**変更:** `app.config.json`, `src/index.template.html`, `assets/favicon.svg`, `APP_SPEC.md`, README日英, CHANGELOG。\
**作成:** `package.json`, `package-lock.json`, `playwright.config.mjs`, `scripts/run-unit-tests.mjs`, `tests/helpers/load-core.mjs`, `tests/helpers/app.mjs`, `tests/e2e/shell.spec.mjs`, `.github/workflows/test-app.yml`。\
**入力:** 最新対象テンプレート、本仕様。\
**出力:** `loadCore()`, `openApp(page, variant)`、日英の空画面、生成HTMLを対象とするテスト環境。

- [ ] **RED:** `shell.spec.mjs` に `shell_is_local_bilingual_and_not_starter` を追加する。アプリ名、動画選択、分析を開く、ライト表示、日英切替、320pxページ横溢れなし、スターターの文字カウントなしを検証する。
- [ ] **失敗確認:** ビルド後 `npm run test:e2e -- tests/e2e/shell.spec.mjs --project=chromium`。未置換スターター等による失敗を確認する。
- [ ] **実装:** APP領域を空状態UIに置換し、共通ヘルプ・トースト・確認・汎用資産APIを維持する。実行時依存ゼロとプライバシー説明を設定する。バージョンを新アプリの0.1.0にし、テンプレートの1.3.0を継承しない。
- [ ] **GREEN:** 共通ビルド・shell試験を再実行する。未実装の計測・結果操作は表示しないか、理由を伴うdisabledとする。
- [ ] **コミット:** `chore: initialize Time Study Desk foundation and test harness`

**受入例:** `expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)`。

### T02: 動画候補・再生・非同期状態

**要件:** R03、R04、R19、R23。\
**変更:** `src/index.template.html` のMEDIA／UI、ヘルプ、`SECURITY.md`。\
**作成:** `tests/e2e/media.spec.mjs`, `tests/fixtures/media/README.md` と小さい試験動画。\
**入力:** ファイル選択、既存確認・非同期コンポーネント。\
**出力:** `MediaController.loadCandidate`, `commitCandidate`, `captureTime`, `seekTo`, `dispose`。返却型は仕様付録B。

- [ ] **RED:** `media_loads_or_preserves_previous_analysis`、`stale_media_cannot_replace_new_source`、`seek_disables_marking` を作る。正常、0バイト、音声のみ、破損、A→B、取消、1.2345678秒の整数化を固定条件にする。
- [ ] **失敗確認:** `npm run test:e2e -- tests/e2e/media.spec.mjs --project=chromium`。メディア状態・世代処理がないことによる失敗を確認する。
- [ ] **実装:** 候補ソースを一時状態で読み、世代一致時だけ確定する。古いBlob URLを解放する。`play()`失敗、無限duration、24時間超、8 GiB超を処理し、シーク中・エラー時の記録を無効にする。
- [ ] **GREEN:** プレイヤー操作、縦動画、ファイル名表示、ネットワーク要求記録を確認する。大容量上限のユニット検査と実ファイル再生試験を区別する。
- [ ] **コミット:** `feat: add local video playback and guarded source lifecycle`

**v0.1.0終了条件:** AC01–AC02、AC22の基礎、通常版・自己展開版の読み込みが合格。計測がまだできない開発版であることを明記する。

---

## 5. v0.2.0 — First Measurement

### T03: 初回計測と境界モデル

**要件:** R04、R05、R17、R19。\
**変更:** `src/index.template.html` CORE／UI。\
**作成:** `tests/helpers/fixtures.mjs`, `tests/fixtures/time-studies.json`, `tests/unit/time.test.mjs`, `tests/unit/commands.test.mjs`, `tests/e2e/first-measurement.spec.mjs`。\
**入力:** MEDIAから取得したtimeUs。\
**出力:** `TsdCore.toTimeUs`, `createProject`, `validateProject`, `applyCommand`。最初はstartCycle／markBoundary／finishCycleを実装する。未実装commandは明示的なエラーとする。

- [ ] **RED:** `marks_four_steps_without_creating_fifth`、`uses_media_time_not_watch_time`、`rejects_non_increasing_boundaries` を追加する。0,6,18,28,34秒で境界4区間、最終区間6秒、初回手順が自動作成されることを検証する。
- [ ] **失敗確認:** `node --test tests/unit/time.test.mjs tests/unit/commands.test.mjs`。
- [ ] **実装:** 共有境界、仮工程名、最後の操作、整数時刻、正の区間、不変条件を実装する。0.25倍でも1倍でも同じtimeUsを与えれば同じProjectになる。
- [ ] **GREEN:** 上記unitと `npm run test:e2e -- tests/e2e/first-measurement.spec.mjs --project=chromium`。スマートフォンでも動画・区切り・終了が同画面で使えることを確認する。
- [ ] **コミット:** `feat: record first-cycle boundaries using media timestamps`

**受入例:** `assert.equal(core.toTimeUs(1.2345678).value, 1234568)`。同じtimeUsの二度目のmarkは `ok:false`、元Project不変。

### T04: 基本修正・Undo・最初の保存形式

**要件:** R09、R12。\
**変更:** CORE／履歴／出力、README・ヘルプ。\
**作成:** `tests/unit/history.test.mjs`, `tests/unit/project-json.test.mjs`, `tests/e2e/basic-save.spec.mjs`, `docs/SAVE_FORMAT.md`。\
**入力:** T03のProject／CommandResult。\
**出力:** moveBoundary、renamePhase、updateProjectMeta、editNote、Undo／Redo、`serializeProject`、手動JSON保存。スキーマは最初から1。

- [ ] **RED:** `boundary_move_is_atomic_and_undoable`、`json_keeps_integer_boundaries_and_no_video` を追加する。6秒境界を7秒へ動かすと隣接工程7秒・11秒、合計34秒を保つ。Undoで6秒・12秒へ戻る。
- [ ] **失敗確認:** `node --test tests/unit/history.test.mjs tests/unit/project-json.test.mjs`。
- [ ] **実装:** 100操作／16 MiBの差分履歴、ドラッグ一操作、名前訂正、保存ファイル名編集を入れる。保存JSONに将来段階の空配列・nullable項目を含め、動画・Blob URL・DOM・Undoを含めない。未確定区間を保存時に勝手に完了しない。
- [ ] **GREEN:** unit、basic-save E2E、JSONの実ファイル内容を確認する。v0.2.0では復元未実装を明示し、復元ボタンを成功しそうに見せない。
- [ ] **コミット:** `feat: add reversible boundary edits and versioned analysis export`

**v0.2.0終了条件:** AC03–AC04、AC06–AC07の基礎、保存ファイルの検証が合格。一回の計測・修正・JSON保存が完結する。

---

## 6. v0.3.0 — Repeat / Procedure

### T05: 反復計測と回間時間

**要件:** R06。\
**変更:** CORE／計測画面。\
**作成:** `tests/unit/cycles.test.mjs`, `tests/e2e/repeat.spec.mjs`。\
**入力:** 確定済み手順。\
**出力:** 手順付きstartCycle、反復markBoundary、finishCycle、回間時間の派生値。

- [ ] **RED:** `repeats_procedure_without_reentering_names`、`does_not_auto_start_next_cycle`、`gap_is_not_part_of_either_cycle` を追加する。0–34、39–72、77–127の三回、隙間10秒を指定する。
- [ ] **失敗確認:** `node --test tests/unit/cycles.test.mjs`。
- [ ] **実装:** 現在の回・工程・次工程の表示、明示開始・終了、一つのopen回、非重複を実装する。最終工程はmarkBoundaryではなくfinishCycleを選ぶ。
- [ ] **GREEN:** unitと `npm run test:e2e -- tests/e2e/repeat.spec.mjs --project=chromium`。戻し再生で過去境界を書き換えないことも確認する。
- [ ] **コミット:** `feat: measure repeated cycles with explicit starts and gaps`

### T06: 工程ID・手順の変更・条件

**要件:** R07、R22。\
**変更:** CORE／手順UI／保存形式説明。\
**作成:** `tests/unit/procedures.test.mjs`, `tests/e2e/procedure-change.spec.mjs`。\
**入力:** Phase、Procedure、既存回。\
**出力:** createPhase、renamePhase、updatePhaseMeta、renameProcedure、changeProcedure、開始・終了条件の不変スナップショット。

- [ ] **RED:** `rename_preserves_phase_ids`、`structural_change_preserves_old_cycles` を追加する。工程順を `[phase-1, phase-2]` から逆順へ変えても古いprocedureとcycle参照が不変であることを検証する。新規工程作成だけでは既存手順が変わらず、工程アーカイブでも過去の時間を失わないことを加える。
- [ ] **失敗確認:** `node --test tests/unit/procedures.test.mjs`。
- [ ] **実装:** 構造変更は新procedure ID。使用中の工程の削除は過去IDの破棄でなくアーカイブ・次手順からの除去とする。同名を勝手に統合しない。手順変更の確認文言を日英で用意する。
- [ ] **GREEN:** procedure E2E、JSONの各回参照を確認する。将来の集計が手順ID単位で行える構造をテストで固定する。
- [ ] **コミット:** `feat: preserve procedure revisions and observation conditions`

**v0.3.0終了条件:** AC05、AC13。三回を再入力なしで計測でき、手順・条件を変更しても過去の記録を破壊しない。

---

## 7. v0.4.0 — Exceptions / Editing

### T07: 中断・実施なし・未観測・未完了

**要件:** R08、R19。\
**変更:** CORE／計測のその他操作／状態表示。\
**作成:** `tests/unit/exceptions.test.mjs`, `tests/e2e/exceptions.spec.mjs`, `tests/e2e/media-end.spec.mjs`。\
**入力:** 既存回・実施・境界。\
**出力:** skipOccurrence、begin/endInterruption、begin/endUnobserved、closeIncomplete、resumeCycle、resolveOccurrence。

- [ ] **RED:** `interruption_splits_one_occurrence_without_losing_time`、`not_performed_is_not_zero`、`unobserved_preserves_known_part`、`ended_does_not_complete_cycle` を追加する。
- [ ] **失敗確認:** `node --test tests/unit/exceptions.test.mjs` とmedia-end E2E。
- [ ] **実装:** F1の5秒工程＋15秒中断＋5秒工程を同一実施へ対応付ける。未観測を別区間にする。実施なしでは0区間を作らない。末尾到達時は未完了として保存可能にする。最後の境界と同時刻のfinishCycleは、見直しで全状態を解決した場合に限り、0秒区間を作らず完了できる。resumeCycleは最後の境界から同じ実施へ継続する。長い回の自動除外を入れない。
- [ ] **GREEN:** 全unitとexceptions／media-end E2E。復帰時に壁時計の離席時間を中断として挿入しないことを確認する。
- [ ] **コミット:** `feat: model interruptions missing observations and incomplete cycles`

**受入例:** F1三回目の工程3のphase区間合計は10,000,000 µs、中断は15,000,000 µs、一回全体は50,000,000 µs。

### T08: 分割・結合・割当て・追加工程

**要件:** R08、R09。\
**変更:** CORE／見直し画面／Undo。\
**作成:** `tests/unit/interval-editing.test.mjs`, `tests/e2e/review-editing.spec.mjs`。\
**入力:** 共有境界とSpan。\
**出力:** splitSpan、mergeSpans、assignSpan、insertOccurrence、deleteCycle。

- [ ] **RED:** `split_merge_preserves_total`、`rework_is_one_phase_total_per_cycle`、`deletion_never_creates_unassigned_time_silently` を追加する。10秒区間を4＋6へ分割し再結合して10秒、Undo後に元ID関係を復元する。
- [ ] **失敗確認:** `node --test tests/unit/interval-editing.test.mjs`。
- [ ] **実装:** ドラッグ以外の境界編集、明示割当て、同一工程の追加実施を実装する。使われなくなった実施状態を再検証し、pendingが残る完了回を許さない。回削除はUndo可能とする。
- [ ] **GREEN:** unit、review-editing E2E、100操作の履歴・16 MiB上限・Redo破棄を試験する。
- [ ] **コミット:** `feat: add complete interval review and reversible reassignment`

**v0.4.0終了条件:** AC08–AC10の入力モデル、AC12、AC14、完全なAC07。中断・未観測を消して帳尻を合わせる修正が不要であること。

---

## 8. v0.5.0 — Save / Resume

### T09: 安全な読み込みと元動画の再接続

**要件:** R12、R13。\
**変更:** CORE／MEDIA／読み込みUI。\
**作成:** `tests/unit/project-import.test.mjs`, `tests/unit/source-match.test.mjs`, `tests/e2e/resume.spec.mjs`。\
**入力:** .tsd.json、動画候補。\
**出力:** `parseProject`, `validateProject`, `matchSource`、動画なしの分析閲覧状態。

- [ ] **RED:** `round_trip_preserves_schema1_project`、`rejects_bad_import_without_mutation`、`source_match_never_claims_identity` を追加する。未来版、参照欠損、重複ID、負数、10 MiB超、不正手順を試験する。
- [ ] **失敗確認:** `node --test tests/unit/project-import.test.mjs tests/unit/source-match.test.mjs`。
- [ ] **実装:** 許可フィールドからProjectを再構成し、全検証成功後だけ交換する。サイズ・縦横・長さ差100,000 µsの候補照合を実装する。一致しても本人確認を要求し、不一致の強制接続を設けない。
- [ ] **GREEN:** resume E2Eで保存→閉じる→JSONだけ開く→動画を再選択→最後の確定境界から続ける。v0.2.0の保存fixtureの読み込みを固定回帰にする。
- [ ] **コミット:** `feat: restore validated analyses and reconnect original video`

**受入例:** 同サイズ等でduration差100,000 µsはcompatible=true、100,001 µsはfalse。候補長が既存最終境界より短い場合は、照合がcompatibleでも再接続しない。どちらも動画同一性の証明とは表示しない。

### T10: 自動保存・復元・競合

**要件:** R14、R19、R23。\
**変更:** STORAGE／設定／復元カード／ヘルプ。\
**作成:** `tests/e2e/persistence.spec.mjs`, `tests/e2e/persistence-conflict.spec.mjs`。\
**入力:** 検証済みProjectと更新リビジョン。\
**出力:** `StorageAdapter.load/save/clear`、保存キュー、別タブ競合検出。

- [ ] **RED:** `autosave_status_follows_transaction_success`、`quota_failure_keeps_manual_export`、`stale_tab_cannot_overwrite_new_revision` を追加する。保存750 ms、連続編集時最長5秒、保存失敗、期待revision不一致を検証する。
- [ ] **失敗確認:** `npm run test:e2e -- tests/e2e/persistence.spec.mjs tests/e2e/persistence-conflict.spec.mjs --project=chromium`。
- [ ] **実装:** IndexedDBでsnapshotとmetaを原子的に更新する。ON/OFFを端末側設定として扱う。前回の分析復元と専用データ削除を設ける。保存失敗でアプリ全体を停止せず、成功トーストを出さない。
- [ ] **GREEN:** 二つのブラウザページ、ストレージ禁止、トランザクション失敗、クリア中の保留保存、file://での保存機能検出を確認する。クリア直後に遅延保存でデータを復活させない。
- [ ] **コミット:** `feat: add honest autosave recovery and conflict protection`

**v0.5.0終了条件:** AC15–AC18。分析JSONと動画を別に選んで作業を再開でき、自動保存不能でも手動保存できる。

---

## 9. v0.6.0 — Results / Review

### T11: 共通集計エンジンと母集団

**要件:** R10、R22。\
**変更:** CORE、固定fixture。\
**作成:** `tests/unit/statistics.test.mjs`, `tests/unit/invariants.test.mjs`。\
**入力:** 検証済みProject、単一procedureId。\
**出力:** `TsdCore.summarize(project, procedureId): Summary`、setCycleExclusion。

- [ ] **RED:** `f1_means_include_interruption`、`f2_missing_step_does_not_enter_denominator`、`f3_partial_observation_is_not_full_step`、`f4_incomplete_cycle_is_excluded`、`f5_manual_exclusion_keeps_rows` を追加する。仕様の期待値をそのまま使う。
- [ ] **失敗確認:** `node --test tests/unit/statistics.test.mjs tests/unit/invariants.test.mjs`。
- [ ] **実装:** CとC_pを分け、整数の区間和から集計する。同じ工程の分割・やり直しを回内で合計して一観測とする。異なる手順は別集計、長い値の自動除外なし、中央値を定義どおり計算する。
- [ ] **GREEN:** 0件・1件・偶数件・全件除外・未完了と除外の重複件数を確認する。ランダムな正の区間で共有境界・加算恒等式・移動Undoの不変条件を試験する。
- [ ] **コミット:** `feat: calculate transparent cycle and step statistics`

**固定アサーション:**

```javascript
assert.equal(core.summarize(makeFixture('F1'), 'procedure-1').cycleTotals.elapsed.meanUs, 39000000);
assert.equal(core.summarize(makeFixture('F2'), 'procedure-1').phaseStats['phase-3'].n, 3);
assert.equal(core.summarize(makeFixture('F2'), 'procedure-1').cycleTotals.elapsed.meanUs, 35750000);
assert.equal(core.summarize(makeFixture('F5'), 'procedure-1').counts.included, 2);
```

### T12: 時間表・内訳・根拠映像

**要件:** R10、R11。\
**変更:** UI／MEDIA／SVG。\
**作成:** `tests/e2e/results.spec.mjs`, `tests/e2e/evidence-review.spec.mjs`。\
**入力:** Summary、現在のソース状態。\
**出力:** 時間表、件数付き統計、平均棒グラフ、選択回内訳、区間選択・区間再生。

- [ ] **RED:** `results_use_same_summary_as_export`、`number_opens_exact_evidence_range`、`detached_video_keeps_results_readable` を追加する。F1の50秒セルが77–127秒を選択して停止することを確認する。
- [ ] **失敗確認:** `npm run test:e2e -- tests/e2e/results.spec.mjs tests/e2e/evidence-review.spec.mjs --project=chromium`。
- [ ] **実装:** n、未観測・実施なし・除外状態を表示する。数値クリックはシークまでで自動再生せず、明示操作で区間再生する。表・グラフが別々の平均を計算しない。
- [ ] **GREEN:** 動画未選択、シーク失敗、選択回削除、手順切替、0件で破綻しない。グラフは0始点、色以外の種別表現を確認する。
- [ ] **コミット:** `feat: connect time tables and charts to video evidence`

**v0.6.0終了条件:** AC08–AC11、AC14の数値、AC15の動画なし結果閲覧。F1〜F5の全期待値が自動テストで合格する。

---

## 10. v0.7.0 — CSV / Export

### T13: CSV三種と欠損・理由の保持

**要件:** R15、R22。\
**変更:** CORE／EXPORT。\
**作成:** `tests/unit/csv.test.mjs`, `tests/e2e/csv-export.spec.mjs`, `docs/CSV_FORMAT.md`。\
**入力:** Project、CsvOptions、Summary。\
**出力:** `TsdCore.buildCsv(project, options): string`。

- [ ] **RED:** `csv_preserves_blank_vs_zero_and_exclusion_reason`、`csv_round_trips_quotes_newlines_and_unicode`、`csv_detail_includes_status_only_rows` を追加する。F2の工程3は空欄＋実施なし、F5理由、F1回間時間を検証する。
- [ ] **失敗確認:** `node --test tests/unit/csv.test.mjs`。
- [ ] **実装:** BOM、CRLF、全セル引用、秒の小数点、選択手順スコープ、三種の列を実装する。明細の固定キーは仕様12.2と一致させる。複数ファイルを自動ダウンロードしない。
- [ ] **GREEN:** 独立したテスト用CSVパーサで読み戻し、行・列・値を確認する。生成関数と同じ引用処理をパーサに使わない。日英CSVを実ファイルで確認する。
- [ ] **コミット:** `feat: export time tables summaries and interval CSV`

### T14: ファイル名・安全な出力・失敗表示

**要件:** R15、R16。\
**変更:** CORE／EXPORT／SECURITY.md。\
**作成:** `tests/unit/filename.test.mjs`, `tests/unit/export-security.test.mjs`, `tests/e2e/export-failure.spec.mjs`。\
**入力:** 利用者入力文字列、出力名、CSV／JSON。\
**出力:** `sanitizeFilename(base, suffix)`、安全なCSVテキスト処理、ダウンロード状態。

- [ ] **RED:** `dangerous_text_is_not_formula`、`edited_filename_is_used`、`download_handoff_is_not_disk_success` を追加する。`=1+1`, 空白後の`@SUM(...)`, 改行、全角先頭記号、`../CON`、空名を入力する。
- [ ] **失敗確認:** `node --test tests/unit/filename.test.mjs tests/unit/export-security.test.mjs`。
- [ ] **実装:** 仕様の危険文字判定と引用順を固定する。元入力はJSONに保持する。ファイル名サニタイズ、固定拡張子、現在入力の保持、出力準備失敗を実装する。
- [ ] **GREEN:** 出力物を読み、列数・欠損・名称・状態を確認する。Excelともう一つの利用可能な表計算ソフトで初回インポートを確認し、未実施ソフトは記録する。出力内容を勝手にWebへ送らない。
- [ ] **コミット:** `fix: harden export filenames text cells and failure handling`

**v0.7.0終了条件:** AC19–AC21、AC27の出力側。利用者が名前を変え、意図したCSV／分析JSONを保存できる。

---

## 11. v0.8.0 — Mobile / Accessibility

### T15: スマートフォンの操作連続性

**要件:** R02、R17、R19。\
**変更:** LAYOUT／UI／MEDIA、共通下部タブ。\
**作成:** `tests/e2e/mobile.spec.mjs`, `tests/e2e/background.spec.mjs`。\
**入力:** 全機能が動くv0.7.0。\
**出力:** 計測／見直す／結果の三画面、短い画面での復帰・入力。

- [ ] **RED:** `mobile_primary_flow_never_hides_controls`、`keyboard_and_safe_area_do_not_cover_dialog_end`、`background_does_not_insert_interruption` を追加する。320/360/390/430px、短い横画面、長い日英名を使う。
- [ ] **失敗確認:** `npm run test:e2e -- tests/e2e/mobile.spec.mjs tests/e2e/background.spec.mjs`。
- [ ] **実装:** 一つの下部バー、48px主タップ領域、動画直近の再生・境界操作、縦型結果を仕上げる。ソフトキーボード時にダイアログ末尾と閉じる操作を残す。
- [ ] **GREEN:** 自動の画面検証に加え、実機で縦動画・画面回転・ホーム切替を確認する。実機がない場合はエミュレーションのみと明示する。
- [ ] **コミット:** `feat: refine mobile measurement review and results flow`

### T16: キーボード・ヘルプ・日英の完成

**要件:** R02、R18。\
**変更:** I18N／UI／ヘルプ／README日英。\
**作成:** `tests/e2e/accessibility.spec.mjs`, `tests/e2e/localization.spec.mjs`。\
**入力:** 全状態・全操作。\
**出力:** 仕様13章のフォーカス・ショートカット・読み上げ・日英文言。

- [ ] **RED:** `space_does_not_mark_and_play_together`、`text_undo_is_not_project_undo`、`help_last_item_is_reachable` を追加する。ダイアログの起点フォーカス復帰、Tabだけの保存、200%ズームを含める。
- [ ] **失敗確認:** `npm run test:e2e -- tests/e2e/accessibility.spec.mjs tests/e2e/localization.spec.mjs`。
- [ ] **実装:** 操作対象に応じたキー処理、keydown repeat防止、aria-liveの適量通知、色以外の状態説明、reduced-motionを整える。Pause videoと作業中断を区別し、初期・未観測・復元待ち・保存失敗の全状態を翻訳する。
- [ ] **GREEN:** キーボードと利用可能なスクリーンリーダーで確認する。自動検査だけでアクセシビリティ全面適合をうたわない。
- [ ] **コミット:** `feat: complete bilingual help and accessible interaction`

**v0.8.0終了条件:** AC23–AC24。初見の試用者が主要操作を完了できるか観察し、詰まった箇所を修正する。効率改善率は測定前に宣伝しない。

---

## 12. v0.9.0 — Release Candidate

### T17: セキュリティ・CSP・生成物の統合回帰

**要件:** R01、R16、R20、R23。\
**変更:** 必要な修正のみ、既存ビルド検証の意味は弱めない。\
**作成:** `tests/e2e/network.spec.mjs`, `tests/e2e/standalone.spec.mjs`, `tests/e2e/security.spec.mjs`。\
**入力:** ビルド済み三成果物と全試験。\
**出力:** ランタイム外部要求ゼロの証跡、両HTMLの主経路確認。

- [ ] **RED／回帰追加:** 未カバーの全経路に試験を追加する。初回document取得だけを許可し、それ以外のHTTP要求・送信試行・CSP違反を記録する。不要要求がCSPで拒否されても合格にしない。
- [ ] **欠陥時の失敗確認:** network／security／standalone試験を走らせ、見つかった欠陥を再現する。すでに通る適合性試験を故意に壊す必要はない。
- [ ] **修正:** ソース交換、古い保存キュー、インポート文字列、Blob解放、自己展開後のCSPの不備だけを修正する。FFmpegや外部依存で回避しない。
- [ ] **GREEN:** `npm run test:unit`、共通ビルド、`npm run test:e2e`。通常版と自己展開版をfile://とHTTP/HTTPSで確認し、生成ルートコピーをバイト比較する。Chromium／Firefox／WebKitと実機結果を別列で記録する。
- [ ] **コミット:** `test: verify standalone privacy and full workflow regression`

**注意:** 自己展開版が通常版のソースを復元できることと、生成後の全機能が動くことは別の試験とする。

### T18: 大容量・実機・資料・候補判定

**要件:** R20、R21、R24。\
**変更:** README日英、SECURITY、favicon、スクリーンショット。\
**作成:** `docs/QA_MATRIX.md`, `docs/QA_RESULTS.md`, `tests/e2e/scale.spec.mjs`。\
**入力:** 50工程／1,000回／10,000区間、実動画、実機。\
**出力:** 再現条件付きの計測結果、P0/P1/P2分類、v0.9.x候補。

- [ ] **試験定義:** 参照PCとOS／ブラウザ版、Android、iPhone、素材の長さ・サイズ・コーデック、ファイル起動経路をQA_MATRIXへ記録する。マシン固有の最大値を一般保証へ変換しない。
- [ ] **実行:** 標準データの応答・集計のp95を測定し、PC2 GiB程度／スマートフォン500 MiB程度の実ファイルを確認する。入力上限・保存上限は別に境界値試験する。
- [ ] **修正と再試験:** P0/P1は解消して該当回帰を追加する。性能予算超過時は描画の分割等を優先し、保存データを切り捨てて高速化しない。
- [ ] **資料作成:** 正式faviconを同じSVGから埋め込む。実UIで日英PC約1360×900とスマートフォンのスクリーンショットを撮る。未公開URL・未検証の形式・精度宣伝・スターター文言を除く。
- [ ] **コミット:** `docs: prepare release candidate evidence assets and limitations`

**v0.9.0終了条件:** AC01–AC30を行ごとに合格／不合格／未実施で記録する。必須実機が未確認なら候補状態を維持する。ここから新機能を追加せず、修正はv0.9.xとして扱う。

---

## 13. v1.0.0 — Release

### T19: 正式候補の全回帰と保存互換

**要件:** R01、R20、R24。\
**変更:** 欠陥がある場合の修正、QA_RESULTS。\
**入力:** 合格したv0.9.x、v0.2.0以降の保存fixture。\
**出力:** 正式版へ進める検証証跡。

- [ ] **回帰確認:** 全unitとブラウザ試験を実行し、v0.2.0のschema1を含む保存→再開→CSVの往復を再確認する。新しい欠陥があれば失敗する試験から修正する。
- [ ] **実機最終確認:** 日英それぞれ、動画→三回計測→中断／実施なし→境界修正→分析保存→再読込→動画再選択→CSVを通す。初期状態とストレージ失敗経路も再確認する。
- [ ] **成果物照合:** 通常版・自己展開版・rootの生成関係、favicon、サイズ、CSP、版、READMEに記した対応範囲を照合する。
- [ ] **判定:** P0/P1がゼロ、必須受入が合格、残るP2と制約が公開説明にある場合のみ正式版準備へ進む。検証後に別コードを入れたら影響範囲を再試験する。
- [ ] **コミット:** `test: confirm v1.0 release workflow and saved-data compatibility`

### T20: 版・成果物・PRの引渡し

**要件:** R02、R21、R24。\
**変更:** `app.config.json`, 開発用package metadata、CHANGELOG、README日英、リリース記録。\
**入力:** T19合格したソース状態。\
**出力:** v1.0.0の生成物、PRの説明、検証・制約一覧。マージは実行しない。

- [ ] **版の更新:** アプリ版を1.0.0に揃え、必要なpackage metadataとlockを整合させる。保存schemaVersionは1のまま。READMEにアプリ版とテンプレート版を混同して書かない。
- [ ] **再ビルド:** 版更新後のソースからビルドし、版一致・通常／自己展開・root・favicon・主要スモークを確認する。旧候補のHTMLだけをリネームして渡さない。
- [ ] **ドキュメント:** CHANGELOGとPRへ、実装範囲、保存・精度制限、対象環境、実施したコマンド・実機結果、残る制約を記す。スクリーンショットの表示版が変わった場合は更新する。
- [ ] **引渡し:** ユーザーが確認できるブランチ／PR／成果物を示す。PRをマージしない。公開・タグ・Browser Kitty本体への追加を、未依頼のまま実行しない。
- [ ] **コミット:** `chore: prepare Time Study Desk v1.0.0 release`

**v1.0.0終了条件:** 主要用途が実機を含めて完結し、生成物・資料・保存形式・説明が一致している。まだ追加可能な便利機能があることは延期理由にしない。

---

## 14. 要件とタスクの対応表

| 要件 | タスク | 主な受入 |
|---|---|---|
| R01 | T01,T17,T19,T20 | AC25,AC26 |
| R02 | T01,T15,T16,T20 | AC01,AC23,AC24,AC30 |
| R03 | T02 | AC02,AC22 |
| R04 | T02,T03 | AC03,AC06 |
| R05 | T03 | AC04 |
| R06 | T05 | AC05 |
| R07 | T06 | AC13 |
| R08 | T07,T08 | AC08,AC09,AC10,AC12,AC14 |
| R09 | T04,T08 | AC07 |
| R10 | T11,T12 | AC08,AC09,AC10,AC11 |
| R11 | T12 | AC15,映像への移動試験 |
| R12 | T04,T09 | AC15,AC17 |
| R13 | T09 | AC16 |
| R14 | T10 | AC18 |
| R15 | T13,T14 | AC19,AC20,AC21 |
| R16 | T09,T14,T17 | AC17,AC20,AC26,AC27 |
| R17 | T03,T15 | AC23,AC29 |
| R18 | T16 | AC24 |
| R19 | T02,T03,T07,T10,T15 | AC01,AC02,AC12,AC18,AC22 |
| R20 | T17,T18,T19 | AC22,AC28,AC29 |
| R21 | T01,T18,T20 | AC30 |
| R22 | T06,T11,T13 | AC13,AC19 |
| R23 | T02,T10,T17 | AC18,AC26 |
| R24 | T18,T19,T20 | AC29,AC30と判定証跡 |

---

## 15. バージョンごとの引渡し様式

毎段階の報告は以下を含む。進捗率だけで代用しない。

| 項目 | 内容 |
|---|---|
| 対象 | repo、ブランチ、コミット、アプリ版、保存schema版 |
| 今回できるようになったこと | 利用者の操作単位で説明 |
| 変更 | 主なファイルと仕様変更の有無 |
| 検証 | コマンド、対象HTML、OS／ブラウザ、結果、証跡 |
| 未確認 | 実機、形式、大容量、file起動など未実施項目 |
| 次段階の入口 | 合格した条件と、残る修正事項 |

GitHub Actionsの成功をスマートフォン実機の成功に置き換えない。ドキュメントを作成したことをアプリを完成させたこととして報告しない。

---

## 16. この計画作成時点の状態

仕様書と計画のみ作成。テンプレートはGitHubから読取確認したが、Time Study Deskのアプリコード、リポジトリ、ブランチ、コミット、PR、タグ、公開ページは本作業では作成・変更していない。

仕様の集計例・要件ID・タスク対応・ファイル参照の整合は文書レビューの対象とする。アプリのビルド、ブラウザ試験、端末試験は今後の各タスクで行うもので、現時点の合格実績ではない。
