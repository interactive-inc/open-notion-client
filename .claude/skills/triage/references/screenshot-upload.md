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

`inta tools images upload` の URL をそのまま Issue / PR の本文に貼ればよい。ephemeral-images-api（2026-07-09 更新）は GitHub の camo プロキシ（User-Agent `github-camo`、GitHub の IP レンジ検証つき）からの取得を TTL 無視で常に配信するため、**GitHub のページ上では画像が恒久表示される**。ブラウザでの貼り直しや user-attachments 化は不要。

補足の性質を理解して使う。

- 直接 URL を開く一般アクセスは従来どおり TTL（サービス側実装依存、2026-07 時点で 1 日）で expired になる。GitHub 経由でだけ生き続ける設計
- GitHub は本文中の外部画像 URL を user-attachments に**変換しない**（2026-07-08 実測: `gh pr comment` / `gh pr edit --body` とも非変換）。変換されないことを前提にした仕組みなので、URL が ephemeral のまま残っていて正しい
- Slack 等 GitHub 以外への貼り回しは不可（TTL で死ぬ）

手順

```bash
URL=$(inta tools images upload workspace/users/{自分}/tmp/after.png)
gh pr create --body "...![after]($URL)..."
```

複数枚も同様に、全 URL を取得してから 1 回の `gh pr create` / `gh pr edit --body` で本文に含める。

## 投稿直後の検証

投稿・作成の直後に、GitHub の PR ページ上（またはレンダリング済み body: `gh api .../comments -H "Accept: application/vnd.github.html+json"`）で画像が表示されることを確認する。表示されない場合は URL の打ち間違いかアップロード失敗なので、再アップロードして本文を `gh pr edit --body` で更新する。それでも表示されなければ、人間に「PR コメント欄に画像を直接ドロップしてください」と依頼し、ローカルの画像パスを伝える。

## やらないこと

PR コメントの後追い投稿だけで済ませない。本文に貼ること。レビュアーが本文だけ見て変更内容を把握できる状態にする。

`inta tools images upload` の出力 URL をそのまま Slack や別チャンネルに貼り回さない。GitHub 以外では TTL で死ぬ。
