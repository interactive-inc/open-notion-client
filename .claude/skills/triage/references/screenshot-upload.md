スクリーンショットを PR 本文に貼るための特例ルール。`inta tools images` と `agent-browser` の両方が使える環境でのみ適用する。

## 適用条件

両方が使える環境でのみ適用する。片方でも欠ければスキップし、テキストでの説明にとどめる。

確認方法

```bash
inta tools images upload --help >/dev/null 2>&1 && echo "images ok" || echo "images missing"
command -v agent-browser >/dev/null && echo "browser ok" || echo "browser missing"
```

## いつ撮るか

UI に差分のある PR では必ず画像を貼る。UI 差分とは、ユーザーが画面で見える変更が含まれている PR を指す。

該当する変更

レイアウト、色、文言、コンポーネント、画面遷移、エラー画面、空状態、フォーム入力。

該当しない変更

API のみの変更、内部リファクタ、ビルド設定、テストコード追加のみ。

判断に迷うときは「人間がレビュー画面で `Files changed` だけ見て変更内容を完全に把握できるか」を基準にする。把握できないなら貼る。

## 撮り方

撮影対象

最低でも before / after の2枚。複数画面に影響する場合は影響画面すべて。状態遷移がある場合は遷移前後。

agent-browser での撮影手順

ローカルで対象ページを開き、変更前ブランチで before を撮る。変更後ブランチで after を撮る。撮影後は一時ファイルとして保存し、PR 作成直後にアップロードする。

保存先は `workspace/users/{自分}/tmp/` を使う。`workspace/**/tmp/` 以外には置かない。

## アップロードと貼り付け

`inta tools images upload` の URL は約4分間しか有効ではない。これは Slack 等での即時共有を想定した ephemeral 設計のため。

PR 本文に貼る場合は GitHub の自動取り込みを狙う。GitHub は Issue / PR 本文内の外部画像 URL を、保存時に `user-attachments` に取り込んで永続化することがある。ただしこの取り込みは**保証されない**。実測（2026-07-08）では `gh pr comment` の comment 内も `gh pr edit --body` の本文内も画像 URL は変換されず、ephemeral URL のまま残った（=4分後に画像が死ぬ）。`gh pr create` 時の変換は未検証。API（gh）経由の投稿では変換されない前提で、下の検証手順を必ず実行する。

手順

```bash
URL=$(inta tools images upload workspace/users/{自分}/tmp/after.png)
gh pr create --body "...![after]($URL)..."
```

`gh pr create` の `--body` 内に画像 URL を含めれば、GitHub 側が同期的に取り込み、保存後の本文には `https://github.com/user-attachments/...` の永続 URL が入る。元の4分URL が失効しても画像は残る。

順序が重要

アップロードから `gh pr create` までを4分以内に終わらせる。途中で長い処理を挟まない。

複数枚

```bash
BEFORE=$(inta tools images upload workspace/users/{自分}/tmp/before.png)
AFTER=$(inta tools images upload workspace/users/{自分}/tmp/after.png)
gh pr create --body "...
## Screenshots

### Before
![before]($BEFORE)

### After
![after]($AFTER)
..."
```

全ての URL を取得してから1回の `gh pr create` で本文に含める。1枚ずつ追加するとアップロードから貼り付けまでの時間が読めなくなる。

## 投稿直後の検証（必須）

GitHub の取り込みはベストエフォートで、API 経由では変換されないことが多い。投稿・作成の直後に必ず本文を再取得し、URL が `user-attachments` に置換されたか確認する。

```bash
gh pr view {N} --json body -q .body | grep -c "user-attachments"
```

置換されていない場合の復旧手順（上から順に）。

1. ブラウザ操作が使える環境なら、画像をクリップボード経由で PR コメント欄に貼り付けて永続 URL を作り、本文をその URL で `gh pr edit --body` する（macOS: `osascript -e 'set the clipboard to (read (POSIX file "...") as «class PNGf»)'` → GitHub のコメント欄で cmd+v → アップロード完了を待って URL を回収）
2. ブラウザが使えなければ、人間に「PR コメント欄に画像を直接ドロップしてください」と依頼し、ローカルの画像パスを伝える。ephemeral URL を貼ったまま放置しない（4分で死んだ画像リンクが残る）

## やらないこと

PR コメントの後追い投稿だけで済ませない。本文に貼ること。レビュアーが本文だけ見て変更内容を把握できる状態にする。

`inta tools images upload` の出力 URL をそのまま Slack や別チャンネルに貼り回さない。4分で死ぬ。
