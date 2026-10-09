# Time Study Desk / 動画作業分析

[![App tests](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/test-app.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/test-app.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-16624F)](https://github.com/ttomohisa/htmlapps-time-study-desk/actions)

[English README](README.md)

**動画を見ながら工程の区切りを記録し、繰り返し作業の時間を比較する**ブラウザアプリです。計測した数値から該当する動画の区間に戻れます。登録・インストールは不要で、選択した動画や分析内容をアプリからサーバーへ送信しません。

## デモ・画面

GitHub Pagesが有効な環境では、[Time Study Deskを開く](https://ttomohisa.github.io/htmlapps-time-study-desk/)から利用できます。公開が未設定の場合は、GitHub Actionsの成功したビルドの**成果物（Artifact）**から生成HTMLを入手してください。

PCは動画と計測操作を並べた作業台、記録編集では動画と工程一覧の2ペイン、結果画面では統計と保存操作を分離しています。スマートフォンは「計測／記録を編集／結果」を切り替えます。**現行版のスクリーンショット**は[アプリテストのActions](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/test-app.yml)の `time-study-evidence-*` 成果物内 `test-results/screenshots/` にあります。動画は人工のテスト素材で、実際の作業時間を示すものではありません。

## 主な機能

- **1本の動画を工程ごとに区切る** — 再生・シークしながら開始、工程の切替、終了を記録。初回は工程名を知らなくても開始できます。
- **同じ作業を繰り返し比較する** — 1回目の工程順を再利用し、各回を明示的に開始。回間の空き時間は作業時間へ足しません。
- **中断・未観測・実施なしを区別する** — 計測できていない時間を勝手に工程へ配分せず、「実施なし」も0秒として扱いません。
- **記録を見直す** — 共有境界の移動、区間の分割・結合・割当て変更、工程状態・メモの訂正、Undo/Redoに対応します。
- **結果から根拠映像へ戻る** — 回別・工程別統計と母数（n）、時間表、棒グラフを表示し、数値から保存された区間へ移動します。
- **端末内に保存・再開・出力する** — 動画を含まない分析JSON、自動保存（利用可能なIndexedDB）、時間表／集計／区間明細CSVに対応します。

## すぐに使う

### ブラウザで使う

GitHub Pages版が公開されていれば[アプリを開く](https://ttomohisa.github.io/htmlapps-time-study-desk/)だけで使えます。最初のHTML取得には通信が必要ですが、動画と工程情報の処理は端末内で行われます。

### ダウンロードして使う

成功した[Actionsのビルド](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/build-standalone.yml)から生成HTMLを取得し、ブラウザで開きます。通常版 `dist/index.html` は単一ファイルで動作します。軽量な `dist/index.self-extract.html` もありますが、こちらはブラウザの `DecompressionStream` に対応している必要があります。どちらも実行時の外部ライブラリ取得は不要です。

### 操作の流れ

1. **動画を選択** — 動画ファイルを選ぶかドラッグ＆ドロップします。
2. **計測** — 開始位置へシークし「ここから開始」。工程が変わる位置で「ここで区切る」、最後に「この回を終了」を押します。
3. **次の回** — 終了すると計測画面に留まります。「次の回をここから開始」か「記録を編集」「結果を見る」を選びます。次の回は自動開始しません。
4. **記録を編集** — 回を選び、工程名・状態・境界・区間などを修正します。工程順・開始／終了条件を変更した場合は新しい手順になり、過去の回は元の手順を保持します。
5. **結果** — 集計する手順を選び、全体時間・工程別平均・時間表を確認します。集計対象から回を外すときは理由を入力します。
6. **保存** — 「分析データを保存」で `.tsd.json` を取得するか、CSVを種類ごとに保存します。

### 中断・未観測・実施なし

計測中の「その他の記録」から中断または観測できない区間を開始し、「工程へ戻る」で終了します。動画の**一時停止**と作業の**中断記録**は別の操作です。「この工程は実施なし」は実施時間が記録されていない場合に指定します。未完了の回は自動的に完了扱いしません。

### 編集と再生位置

共有境界の変更は、隣り合う両工程の時間へ反映されます。分割・結合・割当て変更では、観測時間を勝手に消したり追加したりしません。区間の状態が確定できなくなった場合は未確定に戻します。

結果画面の数値を選ぶと「記録を編集」で該当区間の開始位置へ移動し、**自動再生せず停止**します。明示的に「この区間を再生」を押した場合のみ再生します。フレーム単位での正確な停止は保証しません。

### キーボード操作

| 操作 | 内容 |
| --- | --- |
| プレイヤーにフォーカスして `Space` | 再生／一時停止 |
| プレイヤーで `←` / `→` | 0.1秒ずつ移動 |
| `Shift` + `←` / `→` | 1秒ずつ移動 |
| `Ctrl` / `⌘` + `Z` | 記録の取り消し（文字入力中は通常の文字Undo） |
| `Ctrl` / `⌘` + `Shift` + `Z` | 記録のやり直し |
| `Esc` | ダイアログを閉じる |

## 保存・再開・CSV

**分析JSON（`.tsd.json`）**には工程名、手順、境界時刻、回、メモなどが入ります。**動画データは含みません**。再読込時はデータ全体を検証してから置き換えます。元動画は別途選択し直してください。サイズ・縦横・動画長を照合しますが、メタデータ一致は同一ファイルの証明ではないため、接続前に確認を求めます。

**自動保存**は対応するブラウザでIndexedDBに分析だけを保持します。初期値はONですが、端末・ブラウザ設定により使えない場合があります。別タブとの競合では新しい記録を勝手に上書きしません。ブラウザ内の保存は永続性や暗号化を保証しません。重要な分析はJSONでも保存してください。

**CSV**は「時間表」「集計」「区間明細」の3種類を、操作ごとに1ファイルずつ出力します。UTF-8 BOM・CRLF・全セル引用、欠損値と0の区別、状態・除外理由を保持します。数式として解釈されるおそれがある利用者テキストはCSV出力時だけ保護します。詳細は [CSV仕様](docs/CSV_FORMAT.md) を参照してください。「ダウンロードを開始しました」はブラウザへの引き渡しを示すだけで、保存先の確認ではありません。

## プライバシー・処理場所

生成HTMLのアプリ処理では `connect-src 'none'` のCSPを使用し、外部API・解析サービス・CDN・広告スクリプトを利用しません。動画は端末上のFile参照とBlob URLで扱います。分析の自動保存はブラウザ内、JSON/CSV出力はダウンロードとして処理します。動画、ファイル名、工程名、メモなどをアプリから送信しません。

GitHub Pages版の初回HTML配信やGitHubサイトへのアクセス自体には通信が発生します。通信を切って使う場合は通常版の単一HTMLをローカルで開いてください。詳しくは [SECURITY.md](SECURITY.md) を参照してください。

## 対応範囲と制限

- 動画は1本、空でないファイル、アプリ上限8 GiB・24時間、シーク可能な映像が対象です。**ブラウザが対応するコーデックである必要があります**。変換は行いません。
- 時刻は動画の `currentTime` を整数マイクロ秒に丸めて保存します。**マイクロ秒精度・フレーム精度を保証する意味ではありません**。スローモーションや編集後の動画から実時間を復元しません。
- これは動画内で観測した時間の比較です。標準時間、作業者レーティング、人員数の算定を行うものではありません。
- Chromium上の自動試験では、スマホ幅、日英、キーボード、JSON互換、CSV、生成HTMLを確認しています。**Android/iPhone実機、実ソフトキーボード、スクリーンリーダー、Safari/Firefox/Edge、実大容量動画での一連操作は未確認**です。
- 自己展開版は `DecompressionStream` が必要です。ローカル `file://` でのIndexedDB保存可否は環境依存です。
- v0.2.0で保存したschema 1の互換fixtureを継続して試験します。保存スキーマはアプリ版とは別の **schemaVersion 1** です。

## 開発・ビルド

アプリの編集対象は `src/index.template.html` です。生成HTMLを直接編集しません。Windowsでは `build-standalone.bat` を実行するか、以下を使います。

```powershell
pwsh -NoProfile -File ./scripts/check-powershell-syntax.ps1
pwsh -NoProfile -File ./scripts/check-repository.ps1
```

生成物は `dist/index.html`、`dist/index.self-extract.html`、通常版と同内容の `time-study-desk.html` です。開発・検証用にはNode.js 22系とPlaywright 1.57.0を使います（**アプリ実行時は不要**）。

```text
npm ci
npx playwright install chromium
npm run test:unit
npm run test:e2e -- --project=chromium
```

リポジトリでは `APP_SPEC.md` を仕様、`docs/SAVE_FORMAT.md` を保存形式、`docs/QA_RESULTS.md` を確認記録として扱います。実行した正確なテスト結果とスクリーンショットは対応するGitHub Actionsの成果物を確認してください。

## 問い合わせ・ライセンス

不具合報告・機能提案は [Issues](https://github.com/ttomohisa/htmlapps-time-study-desk/issues) へお願いします。非公開の動画や分析データをIssueへ添付しないでください。開発参加は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

[MIT License](LICENSE) © 2026 ttomohisa。