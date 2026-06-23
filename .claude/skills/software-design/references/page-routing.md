# Page Routing

Web ページの URL 設計。API ではなく画面のルーティング。

## Layout

- URL の階層 = レイアウトの入れ子。ネストルートで共通レイアウトを共有する
- 親セグメントが共通枠、子セグメントが差し替え領域

## RESTful URL

- リソース指向。URL は名詞のみ、操作を入れない（`/users/new`、`/users/:user/edit` でなく状態で表す）
- リソース名は複数形。`/users`（一覧）→ `/users/:user`（詳細）。OOUI のオブジェクト一覧／詳細に対応
- 階層は所有関係のみ。`/users/:user/posts/:post`

## Params

- パラメータ名はリソースの単数名。`:user`、`:post`
- `:id` を使わない。多階層で `/users/:id/posts/:id` となり変数名が衝突する
